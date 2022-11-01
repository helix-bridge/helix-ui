/// <reference types="jest" />

import { HelixHistoryRecord } from 'shared/model';
import { getDetailPaths } from '../utils/record/path';
import crabDVM from './fixture/crab-dvm.json';
import darwiniaDVM from './fixture/darwinia-dvm.json';
import s2s from './fixture/darwinia-crab-dvm.json';
import s2Parachain from './fixture/crab-crab-parachain.json';
import s2sv2Darwinia from './fixture/darwin-dvm-crab-dvm.json';
import cbridge from './fixture/crab-dvm-heco.json';

describe('paths', () => {
  it.each([...crabDVM, ...darwiniaDVM])('should find substrate 2 dvm path', (record) => {
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2dvm', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2dvm', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2dvm', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2dvm', record.id]);
  });

  it.each(s2s)('should find substrate 2 substrate dvm path', (record) => {
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2s', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2s', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2s', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2s', record.id]);
  });

  it.each(s2Parachain)('should find substrate 2 parachain path', (record) => {
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2parachain', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2parachain', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2parachain', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2parachain', record.id]);
  });

  it.each(s2sv2Darwinia)('should find darwinia-dvm 2 crab-dvm path', (record) => {
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2sv2', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2sv2', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2sv2', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['s2sv2', record.id]);
  });

  it.each(cbridge)('should find crab-dvm 2 heco path', (record) => {
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['cbridge', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['cbridge', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['cbridge', record.id]);
    expect(getDetailPaths(record as HelixHistoryRecord)).toEqual(['cbridge', record.id]);
  });
});
