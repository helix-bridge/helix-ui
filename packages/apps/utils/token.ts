import { message } from 'antd';
import { TokenWithBridgesInfo } from 'shared/model';
import { addAsset } from 'shared/utils/connection';
import Web3 from 'web3';

export function tokenSearchFactory<T extends { address: string; name: string }>(tokens: T[]) {
  const symbols = tokens.map((token) => token.name.toLowerCase());
  let exist = false;

  return (value: string) => {
    if (value) {
      if (Web3.utils.isAddress(value)) {
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

export const asSameToken = (symbol1: string, symbol2: string): boolean => {
  symbol1 = symbol1.toLowerCase();
  symbol2 = symbol2.toLowerCase();

  if (symbol1.length === symbol2.length) {
    return symbol1 === symbol2;
  } else if (symbol1.length > symbol2.length) {
    return symbol1.slice(1) === symbol2;
  } else {
    return symbol2.slice(1) === symbol1;
  }
};

export const asSameCategory = (category1: string, category2: string): boolean => {
  return category1.split('-')[0] === category2.split('-')[0];
};
