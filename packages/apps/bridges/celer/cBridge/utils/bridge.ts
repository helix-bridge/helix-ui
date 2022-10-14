import { BN, hexToBn } from '@polkadot/util';
import { Contract } from 'ethers';
import { base64, getAddress, hexlify } from 'ethers/lib/utils';
import last from 'lodash/last';
import { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from } from 'rxjs/internal/observable/from';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { CrossChainDirection, CrossToken, EthereumChainConfig, HelixHistoryRecord, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Bridge } from '../../../../core/bridge';
import transferAbi from '../config/abi/bridge.json';
import depositAbi from '../config/abi/OriginalTokenVaultV2.json';
import burnAbi from '../config/abi/PeggedTokenBridgeV2.json';
import { CBridgeBridgeConfig, IssuingPayload, RedeemPayload } from '../model';
import { WebClient } from '../ts-proto/gateway/GatewayServiceClientPb';
import { GetTransferStatusRequest, WithdrawLiquidityRequest, WithdrawMethodType } from '../ts-proto/gateway/gateway_pb';
import { WithdrawReq, WithdrawType } from '../ts-proto/sgn/cbridge/v1/tx_pb';

export class CBridgeBridge extends Bridge<CBridgeBridgeConfig, EthereumChainConfig, EthereumChainConfig> {
  static readonly alias = 'CBridgeBridge';

  private prefix = hexToBn('0x6878000000000000');
  public client = new WebClient(`https://cbridge-prod2.celer.network`, null, null);

  send(payload: IssuingPayload | RedeemPayload) {
    const { direction } = payload;

    if (this.isStablecoin(direction) && this.isPegged(direction)) {
      return ['astar', 'crab-dvm'].includes(direction.from.host) ? this.burn(payload) : this.deposit(payload);
    }

    return this.transfer(payload);
  }

  /**
   * astar, crab-dvm send USDC, USDT method
   * */
  back(payload: IssuingPayload): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: {
        from: { address: tokenAddress, amount, decimals, meta: fromChain },
        to,
      },
      bridge,
    } = payload;
    const toChainId = parseInt(to.meta.ethereumChain.chainId, 16);
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = toWei({ value: amount, decimals });
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta)
      ? contracts.stablecoinBacking
      : contracts.stablecoinIssuing;

    if (!contractAddress) {
      console.warn(
        `🚨 Transfer from ${payload.direction.from.symbol} on ${fromChain.name} to ${payload.direction.to.symbol} on ${to.host} terminated because of ${contractAddress} is an invalid contract address`
      );
      return EMPTY;
    }

    return genEthereumContractTxObs(
      contractAddress,
      (contract) => contract.burn(tokenAddress, transferAmount, toChainId, recipient, nonce, { from: sender }),
      burnAbi
    );
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    return this.back(payload);
  }

  deposit(value: IssuingPayload | RedeemPayload): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: {
        from: { address: tokenAddress, amount, decimals, meta: fromChain },
        to,
      },
      bridge,
    } = value;
    const mintChainId = parseInt(to.meta.ethereumChain.chainId, 16);
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = toWei({ value: amount, decimals });
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta)
      ? contracts.stablecoinBacking
      : contracts.stablecoinIssuing;

    if (!contractAddress) {
      console.warn(
        `🚨 Transfer from ${value.direction.from.symbol} on ${fromChain.name} to ${value.direction.to.symbol} on ${to.host} terminated because of ${contractAddress} is an invalid contract address`
      );
      return EMPTY;
    }

    return genEthereumContractTxObs(
      contractAddress,
      (contract) => contract.deposit(tokenAddress, transferAmount, mintChainId, recipient, nonce, { from: sender }),
      depositAbi
    );
  }

  /**
   * common transfer method
   */
  transfer(value: IssuingPayload | RedeemPayload): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: {
        from: { address: tokenAddress, amount, decimals, meta: fromChain },
        to,
      },
      maxSlippage,
      bridge,
    } = value;
    const dstChainId = parseInt(to.meta.ethereumChain.chainId, 16);
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = toWei({ value: amount, decimals });
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts.backing : contracts.issuing;

    return genEthereumContractTxObs(
      contractAddress,
      (contract) =>
        contract.send(recipient, tokenAddress, transferAmount, dstChainId, nonce, maxSlippage, { from: sender }),
      transferAbi
    );
  }

  withdraw(record: HelixHistoryRecord): Observable<Tx> {
    const request = new GetTransferStatusRequest();
    const { id, fromChain, toChain, sender } = record;
    const transferId = last(id.split('-')) as string;
    const { contracts } = this.config;
    const contractAddress = this.isIssue(fromChain, toChain) ? contracts?.backing : contracts?.issuing;

    request.setTransferId(transferId);

    return from(this.client.getTransferStatus(request, null)).pipe(
      switchMap((response) => {
        const { sortedSigsList, signersList, powersList, wdOnchain } = response.toObject();
        const wd = hexlify(base64.decode(wdOnchain as string));
        const sigs = sortedSigsList.map((item) => hexlify(base64.decode(item as string)));

        const signers = signersList.map((item) => {
          const decodeSigners = base64.decode(item as string);
          const hexlifyObj = hexlify(decodeSigners);

          return getAddress(hexlifyObj);
        });

        const powers = powersList.map((item) => {
          const ary = base64.decode(item as string);

          return hexlify(ary);
        });

        return genEthereumContractTxObs(
          contractAddress as string,
          (contract) => contract.withdraw(wd, sigs, signers, powers, { from: sender }),
          transferAbi
        );
      })
    );
  }

  async requestRefund(record: HelixHistoryRecord) {
    const timestamp = Math.floor(Date.now() / 1000);
    const withdrawReq = new WithdrawReq();
    const { id } = record;
    const transferId = last(id.split('-')) as string;

    withdrawReq.setReqId(timestamp);
    withdrawReq.setXferId(transferId);
    withdrawReq.setWithdrawType(WithdrawType.WITHDRAW_TYPE_REFUND_TRANSFER);

    const request = new WithdrawLiquidityRequest();

    request.setWithdrawReq(withdrawReq.serializeBinary());
    request.setMethodType(WithdrawMethodType.WD_METHOD_TYPE_ONE_RM);

    const response = await this.client.withdrawLiquidity(request, null);

    return response;
  }

  async getMinimalMaxSlippage(
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
  ) {
    const contractAddress = this.getPoolAddress(direction);
    const contract = new Contract(contractAddress, transferAbi, entrance.web3.currentProvider);
    const result = await contract.minimalMaxSlippage();

    return result;
  }

  isStablecoin(direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>) {
    const stablecoin = ['USDT', 'USDC', 'BUSD'];

    return stablecoin.includes(direction.from.symbol);
  }

  isPegged(direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>): boolean {
    const peggedFns = [this.is('crab-dvm', 'ethereum'), this.is('ethereum', 'astar'), this.is('crab-dvm', 'astar')];
    const isBSCAstar = this.is('bsc', 'astar');

    if (!this.isStablecoin(direction)) {
      return false;
    }

    if (peggedFns.some((fn) => fn(direction.from.host, direction.to.host))) {
      return true;
    }

    if (isBSCAstar(direction.from.host, direction.to.host) && direction.from.symbol === 'BUSD') {
      return true;
    }

    return false;
  }

  // eslint-disable-next-line complexity
  getPoolAddress(direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>) {
    const { from: departure, to } = direction;

    if (this.isStablecoin(direction) && this.isPegged(direction)) {
      let poolAddress = this.isIssue(departure.host, to.host)
        ? this.config.contracts.stablecoinBacking!
        : this.config.contracts.stablecoinIssuing!;

      if (departure.symbol === 'BUSD' && departure.host === 'astar') {
        poolAddress = this.config.contracts.busdIssuing!;
      }

      return poolAddress;
    }

    return this.isIssue(departure.host, to.host) ? this.config.contracts.backing : this.config.contracts.issuing;
  }
}
