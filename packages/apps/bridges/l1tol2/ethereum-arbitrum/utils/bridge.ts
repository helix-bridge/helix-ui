import { BN } from '@polkadot/util';
import { defaultAbiCoder } from 'ethers/lib/utils';
import omit from 'lodash/omit';
import { Contract } from 'ethers/lib/ethers';
import { ChainConfig, EthereumChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { entrance } from 'shared/utils/connection';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { from, Observable, switchMap } from 'rxjs';
import { IssuingPayload, RedeemPayload, EthereumArbitrumBridgeConfig } from '../model';
import l1GatewayRouterAbi from '../config/abi/l1GatewayRouter.json';
import inboxAbi from '../config/abi/inbox.json';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';
import { AllowancePayload } from '../../../../model/allowance';

interface L1ToL2Params {
  maxSubmissionCost: BN;
  gasPrice: BN;
  deposit: BN;
}

export class EthereumArbitrumBridgeL2 extends Bridge<EthereumArbitrumBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'EthereumArbitrumBridgeL2';
  private l2GasLimit = '600000';
  private l2FixedDataSize = '1600';
  private feeScaler = '1.1';
  // To ensure a successful transaction, we set the scaler to be 3 times
  private l2GasPriceScaler = '3';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return this.transfer(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return this.transfer(payload, fee);
  }

  transfer(
    value: CrossChainPayload<
      Bridge<EthereumArbitrumBridgeConfig, ChainConfig, ChainConfig>,
      CrossToken<ChainConfig>,
      CrossToken<ChainConfig>
    >,
    _fee: BN
  ): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: {
        from: { address: tokenAddress, amount, decimals, meta: fromChain },
        to,
      },
      bridge,
    } = value;
    const transferAmount = toWei({ value: amount, decimals });
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts!.backing : contracts!.issuing;

    return from(this.getL1toL2Params(value.direction)).pipe(
      switchMap((params) => {
        const innerData = defaultAbiCoder.encode(['uint256', 'bytes'], [params.maxSubmissionCost.toString(), '0x']);
        return sendTransactionFromContract(
          contractAddress,
          (contract) => {
            // a little refund fee received by helixDao wallet to indict that the tx is sent by helix
            return contract.outboundTransferCustomRefund(
              tokenAddress,
              contracts!.helixDaoAddress,
              recipient,
              transferAmount,
              this.l2GasLimit,
              params.gasPrice.toString(),
              innerData,
              {
                from: sender,
                value: params.deposit.toString(),
              }
            );
          },
          l1GatewayRouterAbi
        );
      })
    );
  }

  getEstimateTime(): string {
    return '15-20';
  }

  async getL1toL2Params(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<L1ToL2Params> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;

    const l1Provider = entrance.web3.getInstance(departure.provider.https);
    const l2Provider = entrance.web3.getInstance(arrival.provider.https);

    const feeScaler = Number(this.feeScaler);
    const l1BaseFee = (await l1Provider.getBlock('latest')).baseFeePerGas;
    const l2GasPrice = await l2Provider.getGasPrice();
    const scaleL1BaseFee = (Number(l1BaseFee) * feeScaler).toFixed();
    const scaleL2GasPrice = (Number(l2GasPrice) * Number(this.l2GasPriceScaler)).toFixed();
    const address = this.isIssue(departure, arrival) ? this.config.contracts?.backing : this.config.contracts?.issuing;
    const contract = new Contract(address as string, l1GatewayRouterAbi, l1Provider);
    const inboxAddress = await contract.inbox();
    const inboxContract = new Contract(inboxAddress as string, inboxAbi, l1Provider);
    const maxSubmissionCost = await inboxContract.calculateRetryableSubmissionFee(
      this.l2FixedDataSize,
      scaleL1BaseFee.toString()
    );
    const deposit = Number(this.l2GasLimit) * scaleL2GasPrice + Number(maxSubmissionCost);
    const scaleDeposit = (deposit * Number(this.feeScaler)).toFixed();
    return {
      maxSubmissionCost: new BN(maxSubmissionCost.toString()),
      gasPrice: new BN(scaleL2GasPrice.toString()),
      deposit: new BN(scaleDeposit.toString()),
    };
  }

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
  ): Promise<AllowancePayload> {
    return {
      spender: this.config.contracts.gatewayAddress,
      tokenAddress: direction.from.address,
      provider: direction.from.meta.provider.https,
    };
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    try {
      const params = await this.getL1toL2Params(direction);
      return {
        ...omit(direction.from, ['meta', 'amount']),
        decimals: direction.to.decimals,
        amount: new BN(params.deposit.toString()),
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
