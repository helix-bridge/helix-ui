/// <reference types="jest" />

import { dvmAddressToAccountId } from '../../utils/helper/address';

describe('address utils', () => {
  it('can convert dvm address to ss58 format', () => {
    const address = dvmAddressToAccountId('0x245B4775082C144C22a4874B0fBa8c70c510c5AE');

    expect(address.toString()).toBe('5ELRpquT7C3mWtjeomgK938QSQyPJ7XXWSTo7QfqgdCKgZm2');
  });
});
