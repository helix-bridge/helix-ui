/// <reference types="jest" />

import { chainConfigs, getChainConfig } from '../utils/network';
import { isTransferableTokenPair } from '../utils/validate';

// exclude the config that not contains transferable tokens;
const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

describe('token utils', () => {
  describe.each(configs)('$name network', ({ name, tokens, ...rest }) => {
    describe.each(tokens.filter((item) => !!item.cross.length))('$name ', ({ name, cross, ...other }) => {
      it.each(cross)(
        'can cross through $bridge of $category to $partner.symbol on $partner.name',
        ({ bridge, category, partner }) => {
          const config = getChainConfig(partner.name);
          const target = config.tokens.find((item) => isTransferableTokenPair({ name, cross, ...other }, item));

          expect(target).not.toBeUndefined();
        }
      );
    });
  });
});
