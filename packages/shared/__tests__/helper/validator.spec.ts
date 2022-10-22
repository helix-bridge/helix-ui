/// <reference types="jest" />

import { isKton, isRing, isSameAddress, isSS58Address, isValidAddress } from '../../utils/helper/validator';

describe('validator utils', () => {
  const substrateAddress = '5FA7CzAgT5fNDFRdb4UWSZX3b9HJsPuR7F5BF4YotSpKxAA2';
  const darwiniaAddress = '2rGH1BB1E6fvTqiVrHMwNw8r5VrFYznvafn2Uf7amvYdCZ9f';
  const ethereumAddress = '0x245B4775082C144C22a4874B0fBa8c70c510c5AE';
  const karuraAddress = 'rPgRFkyPBveuFfrnxZhbvUbceRK1AVihGEiKpga9NbkPGkg';

  it('should predicate ring correctly', () => {
    expect(isRing('crab')).toBe(true);
    expect(isRing('CRAB')).toBe(true);
    expect(isRing('ring')).toBe(true);
    expect(isRing('RING')).toBe(true);
    expect(isRing('pring')).toBe(true);
    expect(isRing('PRING')).toBe(true);
    expect(isRing('xRing')).toBe(true);
    expect(isRing('xRING')).toBe(true);
    expect(isRing('xOring')).toBe(true);
    expect(isRing('xORING')).toBe(true);
  });

  it('should predicate kton correctly', () => {
    expect(isKton('kton')).toBe(true);
    expect(isKton('KTON')).toBe(true);
    expect(isKton('wckton')).toBe(true);
    expect(isKton('WCKTON')).toBe(true);
    expect(isKton('ckton')).toBe(true);
    expect(isKton('CKTON')).toBe(true);
  });

  it('should predicate address without ss58Prefix', () => {
    expect(isValidAddress(darwiniaAddress, 'darwinia')).toBe(true);
    expect(isValidAddress(darwiniaAddress, 'crab')).toBe(true);
    expect(isValidAddress(darwiniaAddress, 'ethereum')).toBe(false);
    expect(isValidAddress(substrateAddress, 'darwinia')).toBe(true);
    expect(isValidAddress(substrateAddress, 'crab')).toBe(true);
    expect(isValidAddress(substrateAddress, 'ethereum')).toBe(false);
    expect(isValidAddress(ethereumAddress, 'ethereum')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'darwinia')).toBe(false);
    expect(isValidAddress(karuraAddress, 'karura')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'arbitrum')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'moonriver')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'ropsten')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'goerli')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'pangoro-dvm')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'darwinia-dvm')).toBe(true);
    expect(isValidAddress(ethereumAddress, 'crab-dvm')).toBe(true);
    expect(isValidAddress(substrateAddress, 'crab-dvm')).toBe(false);
    expect(isValidAddress(darwiniaAddress, 'crab-dvm')).toBe(false);
  });

  it('should predicate polkadot address ', () => {
    expect(isSS58Address(darwiniaAddress)).toBe(true);
    expect(isSS58Address(substrateAddress)).toBe(true);
    expect(isSS58Address(ethereumAddress)).toBe(false);
    expect(isSS58Address(karuraAddress)).toBe(true);
  });

  it('should recognize the address with different ss58Prefix', () => {
    expect(isSameAddress(darwiniaAddress, substrateAddress)).toBe(true);
    expect(isSameAddress(darwiniaAddress, ethereumAddress)).toBe(false);
    expect(isSameAddress(substrateAddress, ethereumAddress)).toBe(false);
    expect(isSameAddress(darwiniaAddress, karuraAddress)).toBe(true);
  });
});
