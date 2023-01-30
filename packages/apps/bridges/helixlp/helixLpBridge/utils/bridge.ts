import { BN, hexToBn } from '@polkadot/util';
import last from 'lodash/last';
import omit from 'lodash/omit';
import { Observable, switchMap } from 'rxjs';
import {
  BridgeConfig,
  CrossChainDirection,
  CrossToken,
  EthereumChainConfig,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { getOverview } from 'utils/bridge';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import lpBridgeAbi from '../config/abi/lpbridge.json';
import { CrossChainPayload } from '../../../../model/tx';

export abstract class HelixLpBridgeBridge<
  B extends BridgeConfig,
  Origin extends EthereumChainConfig,
  Target extends EthereumChainConfig
> extends Bridge<B, Origin, Target> {
  // static readonly alias = 'HelixLpBridgeBridge';

  private prefix = hexToBn('0x6878000000000000');
  private readonly feePercent = '0.002';

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
    } = value;
    const nonce = new BN(Date.now()).add(this.prefix).toString();
    const transferAmount = toWei({ value: amount, decimals });
    const { contracts } = bridge.config;
    const contractAddress = bridge.isIssue(fromChain, to.meta) ? contracts!.backing : contracts!.issuing;

    return sendTransactionFromContract(
      contractAddress,
      (contract) => {
        if (type === 'native') {
          return contract.lockNativeAndRemoteIssuing(
            transferAmount,
            fee.toString(),
            recipient,
            nonce,
            to.type === 'native',
            {
              from: sender,
              value: new BN(transferAmount).add(fee).toString(),
            }
          );
        } else {
          return contract.lockAndRemoteIssuing(
            nonce,
            recipient,
            transferAmount,
            fee.toString(),
            0,
            to.type === 'native',
            { from: sender }
          );
        }
      },
      lpBridgeAbi
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
          lpBridgeAbi
        );
      })
    );
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
    const overview = getOverview(direction, 'helixLpBridge');
    // basefee + amount * 0.1%
    const totalFee = overview!.basefee! + Number(direction.from.amount) * this.feePercent;
    const fee = toWei({ value: totalFee, decimals: direction.from.decimals });
    return {
      ...omit(direction.from, ['meta', 'amount']),
      decimals: direction.to.decimals,
      amount: new BN(fee),
    };
  }

  validateDirection(
    direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
  ): [boolean, string][] {
    const min = 0;

    return [[+direction.from.amount > min, 'The transfer amount must greater than 0']];
  }
}
