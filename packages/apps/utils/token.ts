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
      message.error('Add failed!');
    }
  } catch {
    message.error('Some error occurred while add the token to metamask, consider add it manually');
  }
}
