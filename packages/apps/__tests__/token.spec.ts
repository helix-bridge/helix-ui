/// <reference types="jest" />

import { chainConfigs, getChainConfig } from 'shared/utils/network';
import { isTransferableTokenPair } from '../utils';

describe('token utils', () => {
  describe.each(chainConfigs)('$name network', ({ name, tokens, ...rest }) => {
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
