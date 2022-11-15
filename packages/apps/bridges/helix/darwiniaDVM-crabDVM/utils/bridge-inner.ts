import { BN, BN_ZERO } from '@polkadot/util';
import { Observable } from 'rxjs';
import {
  ChainConfig,
  CrossChainDirection,
  CrossChainPureDirection,
  CrossToken,
  DVMChainConfig,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { isNativeToken, isRing } from 'shared/utils/helper/validator';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import wringABI from '../config/wring.json';
import { IssuingPayload, RedeemPayload, DarwiniaDVMCrabDVMBridgeConfig } from '../model';

export class DarwiniaDVMInnerBridge extends Bridge<DarwiniaDVMCrabDVMBridgeConfig, DVMChainConfig, DVMChainConfig> {
  static readonly alias: string = 'DarwiniaDVMInnerBridge';

  send(payload: IssuingPayload | RedeemPayload): Observable<Tx> {
    const {
      direction: { from: dep },
    } = payload;

    if (dep.symbol.startsWith('W')) {
      return this.burn(payload as RedeemPayload);
    } else {
      return this.back(payload as IssuingPayload);
    }
  }

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return sendTransactionFromContract(
      bridge.config.contracts!.issuing,
      (contract) => contract.deposit({ from: sender, value: amount.toString() }),
      wringABI
    );
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return sendTransactionFromContract(
      bridge.config.contracts!.issuing,
      (contract) => contract.withdraw(amount.toString(), { from: sender }),
      wringABI
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
  ): Promise<TokenWithAmount> {
    const token = direction.from.meta.tokens.find((item) => isRing(item.symbol))!;

    return { ...token, amount: BN_ZERO };
  }

  getMinimumFeeTokenHolding(
    direction: CrossChainPureDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>
  ): TokenWithAmount | null {
    const token = direction.from.meta.tokens.find((item) => isNativeToken(item) && isRing(item.symbol))!;

    return { ...token, amount: new BN(toWei({ value: 1, decimals: token.decimals })) };
  }
}
