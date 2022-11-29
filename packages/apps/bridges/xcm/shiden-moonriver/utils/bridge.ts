import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract } from 'shared/utils/tx';
import abi from '../../../../config/abi/moonriver.json';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenMoonriverBridgeConfig } from '../model';

export class ShidenMoonriverBridge extends Bridge<
  ShidenMoonriverBridgeConfig,
  ParachainChainConfig,
  ParachainChainConfig
> {
  static readonly alias: string = 'ShidenMoonriverBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      direction: { from: departure },
      sender,
      recipient,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const destination = [1, ['0x0000000839', `0x01${convertToDvm(recipient).slice(2)}00`]];
    const weight = 4_000_000_000;

    return sendTransactionFromContract(
      this.config.contracts!.issuing,
      (contract) => contract.transfer(departure.address, amount, destination, weight, { from: sender }),
      abi
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);
    const amount = this.isIssue(from.host, to.host) ? new BN('65168231790366830') : new BN('4635101624671734');

    return { ...token, amount } as TokenWithAmount;
  }
}
