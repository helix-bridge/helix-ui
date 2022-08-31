/// <reference types="jest" />

import { HelixHistoryRecord } from 'shared/model';
import { getDetailPaths } from 'shared/utils/record';

describe('paths', () => {
  const record: HelixHistoryRecord = { id: '0x123' } as HelixHistoryRecord;

  it('should find substrate 2 dvm path', () => {
    expect(getDetailPaths('pangolin', 'pangolin-dvm', record)).toEqual(['s2dvm', '0x123']);
    expect(getDetailPaths('pangolin-dvm', 'pangolin', record)).toEqual(['s2dvm', '0x123']);
    expect(getDetailPaths('crab', 'crab-dvm', record)).toEqual(['s2dvm', '0x123']);
    expect(getDetailPaths('crab-dvm', 'crab', record)).toEqual(['s2dvm', '0x123']);
  });

  it('should find substrate 2 substrate dvm path', () => {
    expect(getDetailPaths('pangoro', 'pangolin-dvm', record)).toEqual(['s2s', '0x123']);
    expect(getDetailPaths('pangolin-dvm', 'pangoro', record)).toEqual(['s2s', '0x123']);
    expect(getDetailPaths('darwinia', 'crab-dvm', record)).toEqual(['s2s', '0x123']);
    expect(getDetailPaths('crab-dvm', 'darwinia', record)).toEqual(['s2s', '0x123']);
  });

  it('should find substrate 2 parachain path', () => {
    expect(getDetailPaths('pangolin', 'pangolin-parachain', record)).toEqual(['s2parachain', '0x123']);
    expect(getDetailPaths('pangolin-parachain', 'pangolin', record)).toEqual(['s2parachain', '0x123']);
    expect(getDetailPaths('crab', 'crab-parachain', record)).toEqual(['s2parachain', '0x123']);
    expect(getDetailPaths('crab-parachain', 'crab', record)).toEqual(['s2parachain', '0x123']);
  });

  it('can not find paths', () => {
    expect(getDetailPaths('darwinia', 'ethereum', record)).toEqual([]);
    expect(getDetailPaths('pangolin', 'ropsten', record)).toEqual([]);
  });
});
