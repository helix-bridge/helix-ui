import { BN, hexToBn } from '@polkadot/util';
import last from 'lodash/last';
import omit from 'lodash/omit';
import { Observable, switchMap } from 'rxjs';
import { utils } from 'ethers';
import {
  ChainConfig,
  BridgeConfig,
  CrossChainDirection,
  CrossChainPureDirection,
  CrossToken,
  DailyLimit,
  EthereumChainConfig,
  HelixHistoryRecord,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { getOverview } from 'utils/bridge';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import lnBridgeAbi from '../config/abi/lnbridge.json';
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
      relayer,
      sourceToken,
      depositedMargin,
    } = value;
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = utils.parseUnits(amount.toString(), decimals);
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts!.backing : contracts!.issuing;

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
        } else {
          const providerKey = await contract.getProviderKey(relayer, sourceToken);

          const [provider, totalFee] = await Promise.all([
            contract.lnProviders(providerKey),
            contract.totalFee(relayer, sourceToken, transferAmount),
          ]);
          const transferId = provider?.lastTransferId as string | undefined;

          const overrides = fromChain.name === 'arbitrum-goerli' ? { gasLimit: 1000000 } : undefined;

          return contract.transferAndLockMargin(
            [relayer, sourceToken, transferId, depositedMargin, totalFee],
            transferAmount,
            recipient,
            overrides
          );
        }
      },
      lnBridgeAbi
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
          lnBridgeAbi
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
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const overview = getOverview(direction, 'lnbridgev20');
    // basefee + amount * 0.1%
    const baseFee = overview!.basefee! + Number(direction.from.amount) * Number(this.feePercent);
    let totalFee = toWei({ value: baseFee, decimals: direction.from.decimals });
    // need get realtime fee
    if (overview!.price) {
      const provider = entrance.web3.getInstance(direction.to.meta.provider.https);
      const gasPrice = await provider.getGasPrice();
      const dynamicFee = gasPrice.mul(overview!.price! * Number(this.relayGasLimit));
      totalFee = dynamicFee.add(totalFee).toString();
    }
    return {
      ...omit(direction.from, ['meta', 'amount']),
      decimals: direction.to.decimals,
      amount: new BN(totalFee),
    };
  }

  async getDailyLimit(
    _direction: CrossChainPureDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>
  ): Promise<DailyLimit> {
    return { limit: '500000000000000000000000', spentToday: '0' };
  }
}
