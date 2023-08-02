import { BN, hexToBn } from '@polkadot/util';
import last from 'lodash/last';
import omit from 'lodash/omit';
import { Observable, switchMap } from 'rxjs';
import { utils, BigNumber } from 'ethers';
import {
  BridgeConfig,
  CrossChainDirection,
  CrossToken,
  EthereumChainConfig,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { getOverview } from 'utils/bridge';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import arbEthAbi from '../config/abi/arb-eth.json';
import ethArbAbi from '../config/abi/eth-arb.json';
import { CrossChainPayload } from '../../../../model/tx';

export abstract class LnBridgeBridge<
  B extends BridgeConfig,
  Origin extends EthereumChainConfig,
  Target extends EthereumChainConfig
> extends Bridge<B, Origin, Target> {
  private prefix = hexToBn('0x6878000000000000');
  private readonly feePercent = '0.003';
  private readonly relayGasLimit = '100000';

  send(
    payload: CrossChainPayload<Bridge<B, Origin, Target>, CrossToken<Origin | Target>, CrossToken<Target | Origin>>,
    fee: BN
  ) {
    return this.transfer(payload, fee);
  }

  /**
   * common transfer method
   */
  transfer(
    value: CrossChainPayload<Bridge<B, Origin, Target>, CrossToken<Origin | Target>, CrossToken<Target | Origin>>,
    fee: BN
  ): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: {
        from: { amount, decimals, meta: fromChain, type },
        to,
      },
      bridge,
      snapshot,
    } = value;
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = utils.parseUnits(amount.toString(), decimals);
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts!.backing : contracts!.issuing;
    const contractAbi = bridge.category === 'lnbridgev20-default' ? ethArbAbi : arbEthAbi;

    return sendTransactionFromContract(
      contractAddress,
      async (contract) => {
        if (type === 'native') {
          return contract.lockNativeAndRemoteIssuing(
            transferAmount,
            fee.toString(),
            recipient,
            nonce,
            to.type === 'native',
            {
              from: sender,
              value: transferAmount.add(fee.toString()),
            }
          );
        } else if (snapshot) {
          const { relayer, sourceToken, transferId, depositedMargin, totalFee, withdrawNonce } = snapshot;
          const snapshotArgs =
            bridge.category === 'lnbridgev20-default'
              ? [relayer, sourceToken, transferId, totalFee, withdrawNonce]
              : [relayer, sourceToken, transferId, depositedMargin, totalFee];
          return contract.transferAndLockMargin(snapshotArgs, transferAmount, recipient, { gasLimit: 1000000 });
        }
      },
      contractAbi
    );
  }

  speedUp(record: HelixHistoryRecord, newFee: number): Observable<Tx> {
    const { id, sender, fromChain } = record;
    const transferId = last(id.split('-')) as string;

    const feeToken = this.getTokenConfigFromHelixRecord(record, 'feeToken');
    const fee = toWei({ value: newFee, decimals: feeToken.decimals });

    const fromToken = this.getTokenConfigFromHelixRecord(record, 'sendToken');
    const toToken = this.getTokenConfigFromHelixRecord(record, 'recvToken');

    const bridgeAddress = this.isIssue(fromToken.host, toToken.host)
      ? this.config.contracts!.backing
      : this.config.contracts!.issuing;

    return isMetamaskChainConsistent(this.getChainConfig(fromChain)).pipe(
      switchMap(() => {
        return sendTransactionFromContract(
          bridgeAddress,
          (contract) => {
            if (fromToken.type === 'native') {
              return contract.increaseNativeFee(transferId, {
                from: sender,
                value: fee,
              });
            } else {
              return contract.increaseFee(transferId, fee, {
                from: sender,
              });
            }
          },
          arbEthAbi
        );
      })
    );
  }

  getEstimateTime(): string {
    return '1-30';
  }

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
  ): Promise<AllowancePayload> {
    const { from: departure, to } = direction;
    const bridgeAddress = this.isIssue(departure.host, to.host)
      ? this.config.contracts!.backing
      : this.config.contracts!.issuing;
    return {
      spender: bridgeAddress,
      tokenAddress: direction.from.address,
      provider: direction.from.meta.provider.https,
    };
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>,
    account?: string | boolean,
    options?: { baseFee: string; liquidityFeeRate: number }
  ): Promise<TokenWithAmount | null> {
    let totalFee = '0';
    const amount = Number.isNaN(Number(direction.from.amount)) ? 0 : Number(direction.from.amount);

    if (options) {
      totalFee = utils
        .parseUnits(amount.toString(), direction.from.decimals)
        .mul(options.liquidityFeeRate)
        // eslint-disable-next-line no-magic-numbers
        .div(100000)
        .add(BigNumber.from(options.baseFee))
        .toString();
    } else {
      const overview = getOverview(direction, 'lnbridgev20-default');
      // basefee + amount * 0.1%
      const baseFee = overview!.basefee! + amount * Number(this.feePercent);
      totalFee = toWei({ value: baseFee, decimals: direction.from.decimals });
      // need get realtime fee
      if (overview!.price) {
        const provider = entrance.web3.getInstance(direction.to.meta.provider.https);
        const gasPrice = await provider.getGasPrice();
        const dynamicFee = gasPrice.mul(overview!.price! * Number(this.relayGasLimit));
        totalFee = dynamicFee.add(totalFee).toString();
      }
    }

    return {
      ...omit(direction.from, ['meta', 'amount']),
      decimals: direction.to.decimals,
      amount: new BN(totalFee),
    };
  }
}
