import { TokenMode } from 'shared/model';
import { message } from 'antd';
import { memoize } from 'lodash';
import Web3 from 'web3';

export function tokenSearchFactory<T extends { address: string; name: string }>(tokens: T[]) {
  const symbols = tokens.map((token) => token.name.toLowerCase());
  let isExit = false;

  return (value: string) => {
    if (value) {
      if (Web3.utils.isAddress(value)) {
        return tokens.filter((token) => token.address === value);
      } else if (symbols.some((symbol) => symbol.includes(value.toLowerCase()))) {
        return tokens.filter((token) => token.name.toLowerCase().includes(value.toLowerCase()));
      } else {
        if (!isExit) {
          isExit = true;
          message.error(
            'You might input an invalid token address or a token which not exist',
            // eslint-disable-next-line no-magic-numbers
            3,
            () => (isExit = false)
          );
        }
      }
    }

    return tokens.filter((token) => token.name.toLowerCase().includes(value.toLowerCase()));
  };
}

export const tokenModeToChainMode = memoize((mode: TokenMode) => (mode === 'mapping' ? 'dvm' : 'native'));
