import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import { Observable } from 'rxjs';
import { utils, BigNumber } from 'ethers';
import { BridgeConfig, CrossChainDirection, CrossToken, EthereumChainConfig, Tx } from 'shared/model';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import oppositeAbi from '../config/abi/opposite.json';
import defaultAbi from '../config/abi/default.json';
import { CrossChainPayload } from '../../../../model/tx';

export abstract class LnBridgeBridge<
  B extends BridgeConfig,
  Origin extends EthereumChainConfig,
  Target extends EthereumChainConfig
> extends Bridge<B, Origin, Target> {
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
    void fee;

    const {
      recipient,
      direction: {
        from: { amount, decimals, meta: fromChain, type },
        to,
      },
      bridge,
      snapshot,
    } = value;
    const transferAmount = utils.parseUnits(amount.toString(), decimals);
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts!.backing : contracts!.issuing;
    const contractAbi = bridge.category === 'lnbridgev20-default' ? defaultAbi : oppositeAbi;

    return sendTransactionFromContract(
      contractAddress,
      async (contract) => {
        if (snapshot) {
          const {
            remoteChainId,
            relayer,
            sourceToken,
            targetToken,
            transferId,
            depositedMargin,
            totalFee,
            withdrawNonce,
          } = snapshot;
          const snapshotArgs =
            bridge.category === 'lnbridgev20-default'
              ? [remoteChainId, relayer, sourceToken, targetToken, transferId, totalFee, withdrawNonce]
              : [remoteChainId, relayer, sourceToken, targetToken, transferId, totalFee, depositedMargin];

          if (type === 'native') {
            return contract.transferAndLockMargin(snapshotArgs, transferAmount, recipient, {
              gasLimit: 1000000,
              value: transferAmount.add(totalFee),
            });
          } else {
            return contract.transferAndLockMargin(snapshotArgs, transferAmount, recipient, { gasLimit: 1000000 });
          }
        }
      },
      contractAbi
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
    void account;
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
    }

    return {
      ...omit(direction.from, ['meta', 'amount']),
      decimals: direction.to.decimals,
      amount: new BN(totalFee),
    };
  }
}
