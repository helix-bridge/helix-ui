import { message } from 'antd';
import { CrossOverview, TokenWithBridgesInfo } from 'shared/model';
import { addAsset } from 'shared/utils/connection';
import { isAddress } from 'web3-utils';

export function tokenSearchFactory<T extends { address: string; name: string }>(tokens: T[]) {
  const symbols = tokens.map((token) => token.name.toLowerCase());
  let exist = false;

  return (value: string) => {
    if (value) {
      if (isAddress(value)) {
        return tokens.filter((token) => token.address === value);
      } else if (symbols.some((symbol) => symbol.includes(value.toLowerCase()))) {
        return tokens.filter((token) => token.name.toLowerCase().includes(value.toLowerCase()));
      } else {
        if (!exist) {
          exist = true;
          message.error('You might input an invalid token address or a token which not exist', () => (exist = false));
        }
      }
    }

    return tokens.filter((token) => token.name.toLowerCase().includes(value.toLowerCase()));
  };
}

export async function addToMetamask(token: TokenWithBridgesInfo) {
  const { symbol, decimals, address } = token;

  try {
    // todo: better have a logo url
    const added = await addAsset({ address, decimals, symbol, logo: '' });

    if (added) {
      message.success('Add success');
    } else {
      message.error('Add failed');
    }
  } catch {
    message.error('Some error occurred while add the token to metamask, consider add it manually');
  }
}

export const isTransferableTokenPair = (token1: TokenWithBridgesInfo, token2: TokenWithBridgesInfo): boolean => {
  const check = (token: TokenWithBridgesInfo) => (item: CrossOverview) =>
    item.partner.name === token.host && item.partner.symbol === token.symbol;

  const inToken1 = check(token1);
  const inToken2 = check(token2);
  const overviewList1 = token1.cross.filter(inToken2);
  const overviewList2 = token2.cross.filter(inToken1);

  return !!overviewList1.length && !!overviewList2.length;
};

export const asSameCategory = (category1: string, category2: string): boolean => {
  const c1 = category1.split('-')[0];
  const c2 = category2.split('-')[0];

  return c1 === c2 || c1.toLowerCase() === c2.toLowerCase();
};
