/// <reference types="jest" />

import { isValidAddressStrict } from '../utils/validate';

describe('validator utils', () => {
  const substrateAddress = '5FA7CzAgT5fNDFRdb4UWSZX3b9HJsPuR7F5BF4YotSpKxAA2';
  const darwiniaAddress = '2rGH1BB1E6fvTqiVrHMwNw8r5VrFYznvafn2Uf7amvYdCZ9f';
  const ethereumAddress = '0x245B4775082C144C22a4874B0fBa8c70c510c5AE';
  const karuraAddress = 'rPgRFkyPBveuFfrnxZhbvUbceRK1AVihGEiKpga9NbkPGkg';

  it('should predicate address with ss58Prefix checking', () => {
    expect(isValidAddressStrict(darwiniaAddress, 'darwinia')).toBe(true);
    expect(isValidAddressStrict(darwiniaAddress, 'crab')).toBe(false);
    expect(isValidAddressStrict(darwiniaAddress, 'ethereum')).toBe(false);
    expect(isValidAddressStrict(substrateAddress, 'darwinia')).toBe(false);
    expect(isValidAddressStrict(substrateAddress, 'crab')).toBe(true);
    expect(isValidAddressStrict(substrateAddress, 'ethereum')).toBe(false);
    expect(isValidAddressStrict(ethereumAddress, 'ethereum')).toBe(true);
    expect(isValidAddressStrict(ethereumAddress, 'darwinia')).toBe(false);
    expect(isValidAddressStrict(karuraAddress, 'karura')).toBe(true);
  });
});
