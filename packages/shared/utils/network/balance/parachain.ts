import { AccountData, AccountInfo } from '@darwinia/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { ChainConfig, TokenInfoWithMeta } from '../../../model';
import { entrance, waitUntilConnected } from '../../connection';

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getBalance(fromToken: TokenInfoWithMeta<ChainConfig>, account: string): Promise<BN> {
  const api = entrance.polkadot.getInstance(fromToken.meta.provider);

  await waitUntilConnected(api);

  try {
    let balance: string;
    if (fromToken.type === 'native') {
      const { data } = (await api.query.system.account(account)) as AccountInfo;
      const { free } = data as unknown as AccountData;

      balance = free.toString();
    } else {
      const foreign = await api.query.tokens.accounts(
        account,
        api.createType('AcalaPrimitivesCurrencyCurrencyId', { ForeignAsset: 13 })
      );
      const { free } = foreign.toHuman() as { free: string; reserved: number; frozen: number };

      balance = free.replace(/,/g, '');
    }

    console.log('🚀 ~ file: parachain.ts ~ line 34 ~ getBalance ~ balance', balance);
    return new BN(balance);
  } catch (error) {
    console.warn('🚨 ~ file: parachain.ts ~ line 21 ~ getBalance ~ error', (error as Record<string, string>).message);

    return BN_ZERO;
  }
}
