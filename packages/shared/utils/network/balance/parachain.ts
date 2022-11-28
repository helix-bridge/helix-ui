import { AccountData, AccountInfo } from '@darwinia/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { ChainConfig, ParachainNetwork, TokenInfoWithMeta } from '../../../model';
import { entrance } from '../../connection';

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getBalance(fromToken: TokenInfoWithMeta<ChainConfig>, account: string): Promise<BN> {
  const api = entrance.polkadot.getInstance(fromToken.meta.provider.wss);

  const darwiniaParachain: ParachainNetwork[] = ['crab-parachain', 'pangolin-parachain'];

  try {
    let balance: string;
    if (fromToken.type === 'native' || darwiniaParachain.includes(fromToken.host as ParachainNetwork)) {
      const { data } = (await api.query.system.account(account)) as AccountInfo;
      const { free } = data as unknown as AccountData;

      balance = free.toString();
    } else {
      const foreign = await api.query.tokens.accounts(
        account,
        api.createType('AcalaPrimitivesCurrencyCurrencyId', { ForeignAsset: fromToken.address })
      );
      const { free } = foreign.toHuman() as { free: string; reserved: number; frozen: number };

      balance = free.replace(/,/g, '');
    }

    return new BN(balance);
  } catch (error) {
    return BN_ZERO;
  }
}
