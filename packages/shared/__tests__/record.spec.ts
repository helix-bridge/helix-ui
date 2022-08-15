/// <reference types="jest" />

import { HelixHistoryRecord } from '../model';
import {
  getTokenConfigFromHelixRecord,
  getReceivedAmountFromHelixRecord,
  getFeeAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
} from '../utils/record/record';
import darwiniaDVMRecords from './fixture/darwinia-dvm.json';
import crabDVMRecords from './fixture/crab-dvm.json';
import crabDVMHecoRecords from './fixture/crab-dvm-heco.json';
import darwiniaCrabDVMRecords from './fixture/darwinia-crab-dvm.json';
import crabCrabParachainRecords from './fixture/crab-crab-parachain.json';

/**
 * transfer overview:
 *
 * ```md
 * |from | to | feeToken | fee |
 * | :--: |:--: |:--: |:--: |
 * | crab | crab-dvm | crab | 0 |
 * | crab-dvm | crab | crab | 0 |
 * | darwinia | crab-dvm | ring | > 0 |
 * | crab-dvm | darwinia | crab | > 0 |
 * | darwinia | ethereum | ring | > 0 |
 * | ethereum | darwinia | ring | > 0 |
 * | crab | crab-parachain | crab | > 0 |
 * | crab-parachain | crab | crab | > 0 |
 * | crab-dvm | heco | xRing | > 0 |
 * | heco | crab-dvm | ring | > 0 |
 * ```
 */

describe('record utils', () => {
  it('should get token name from helix record', () => {
    const crab2CrabDVMSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess?.symbol).toEqual('CRAB');
    expect(crabDVM2CrabSuccess?.symbol).toEqual('CRAB');

    const crabDVM2HecoRefunded = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded?.symbol).toEqual('xRING');
    expect(crabDVM2HecoSuccess?.symbol).toEqual('xRING');

    const darwinia2CrabDVMSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess?.symbol).toEqual('RING');
    expect(crabDVM2DarwiniaSuccess?.symbol).toEqual('xRING');

    const crab2CrabParachainSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess?.symbol).toEqual('CRAB');
    expect(crabParachain2CrabSuccess?.symbol).toEqual('CRAB');

    const darwinia2dvmSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwiniaDVMRecords[0]);
    const dvm2DarwiniaSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwiniaDVMRecords[1]);

    expect(darwinia2dvmSuccess?.symbol).toEqual('RING');
    expect(dvm2DarwiniaSuccess?.symbol).toEqual('RING');
  });

  it('should get received amount from helix record', () => {
    const crab2CrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('999');
    expect(crabDVM2CrabSuccess).toEqual('9,400');

    const crabDVM2HecoRefunded = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('233');
    expect(crabDVM2HecoSuccess).toEqual('488.154702151400626023');

    const darwinia2CrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('881');
    expect(crabDVM2DarwiniaSuccess).toEqual('1');

    const crab2CrabParachainSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('1,000');
    expect(crabParachain2CrabSuccess).toEqual('2');
  });

  it('should get sent amount from helix record', () => {
    const crab2CrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('999');
    expect(crabDVM2CrabSuccess).toEqual('9,400');

    const crabDVM2HecoRefunded = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('233');
    expect(crabDVM2HecoSuccess).toEqual('579.03');

    const darwinia2CrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('881');
    expect(crabDVM2DarwiniaSuccess).toEqual('1');

    const crab2CrabParachainSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('1,000');
    expect(crabParachain2CrabSuccess).toEqual('2');
  });

  it('should get fee amount from helix record', () => {
    const crab2CrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('0');
    expect(crabDVM2CrabSuccess).toEqual('0');

    const crabDVM2HecoRefunded = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('0');
    expect(crabDVM2HecoSuccess).toEqual('0.000000090875297849');

    const darwinia2CrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('39');
    expect(crabDVM2DarwiniaSuccess).toEqual('179');

    const crab2CrabParachainSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('100');
    expect(crabParachain2CrabSuccess).toEqual('15');
  });
});
