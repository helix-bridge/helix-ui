/// <reference types="jest" />

import { HelixHistoryRecord } from '../model';
import {
  getTokenSymbolFromHelixRecord,
  getReceivedAmountFromHelixRecord,
  getFeeAmountFromHelixRecord,
  getSentAmountFromHelixRecord,
} from '../utils/record/record';
import data from './fixture/records.json';

/**
 * transfer overview:
 *
 * ```md
 * |from | to | feeToken | fee | sentAmount |
 * | :--: |:--: |:--: |:--: |:--: |
 * | crab | crab-dvm | crab | 0 |  receiveAmount |
 * | crab-dvm | crab | crab | 0 |  receiveAmount |
 * | darwinia | crab-dvm | ring | > 0 |  receiveAmount + fee |
 * | crab-dvm | darwinia | crab | > 0 |  receiveAmount |
 * | darwinia | ethereum | ring | > 0 |  receiveAmount + fee |
 * | ethereum | darwinia | ring | > 0 |  receiveAmount + fee |
 * | crab | crab-parachain | crab | > 0 | receiveAmount + fee | 
 * | crab-parachain | crab | crab | > 0 | receiveAmount + fee | 
 * | crab-dvm | heco | xRing | > 0 |  receiveAmount + fee |
 * | heco | crab-dvm | ring | > 0 |  receiveAmount + fee |
 * ```
 * 
 * TODO: missing crab-parachain -> crab records
 */

const testRecords = data as HelixHistoryRecord[];

describe('record utils', () => {
  it('should get token name from helix record', () => {
    const crab2CrabDVMSuccess = getTokenSymbolFromHelixRecord(testRecords[0]);
    const crabDVM2HecoRefunded = getTokenSymbolFromHelixRecord(testRecords[1]);
    const darwinia2CrabDVMSuccess = getTokenSymbolFromHelixRecord(testRecords[2]);
    const crabDVM2CrabSuccess = getTokenSymbolFromHelixRecord(testRecords[3]);
    const crabDVM2DarwiniaSuccess = getTokenSymbolFromHelixRecord(testRecords[4]);
    const crabDVM2HecoSuccess = getTokenSymbolFromHelixRecord(testRecords[5]);
    const crab2CrabParachainSuccess = getTokenSymbolFromHelixRecord(testRecords[6]);

    expect(crab2CrabDVMSuccess).toEqual('CRAB');
    expect(crabDVM2HecoRefunded).toEqual('xRING');
    expect(darwinia2CrabDVMSuccess).toEqual('RING');
    expect(crabDVM2CrabSuccess).toEqual('CRAB');
    expect(crabDVM2DarwiniaSuccess).toEqual('xRING');
    expect(crabDVM2HecoSuccess).toEqual('xRING');
    expect(crab2CrabParachainSuccess).toEqual('CRAB');
  });

  it('should get received amount from helix record', () => {
    const crab2CrabDVMSuccess = getReceivedAmountFromHelixRecord(testRecords[0]);
    const crabDVM2HecoRefunded = getReceivedAmountFromHelixRecord(testRecords[1]);
    const darwinia2CrabDVMSuccess = getReceivedAmountFromHelixRecord(testRecords[2]);
    const crabDVM2CrabSuccess = getReceivedAmountFromHelixRecord(testRecords[3]);
    const crabDVM2DarwiniaSuccess = getReceivedAmountFromHelixRecord(testRecords[4]);
    const crabDVM2HecoSuccess = getReceivedAmountFromHelixRecord(testRecords[5]);
    const crab2CrabParachainSuccess = getReceivedAmountFromHelixRecord(testRecords[6]);

    expect(crab2CrabDVMSuccess).toEqual('1,190');
    expect(crabDVM2HecoRefunded).toEqual('140');
    expect(darwinia2CrabDVMSuccess).toEqual('49,960');
    expect(crabDVM2CrabSuccess).toEqual('0.999699485');
    expect(crabDVM2DarwiniaSuccess).toEqual('15,000');
    expect(crabDVM2HecoSuccess).toEqual('100');
    expect(crab2CrabParachainSuccess).toEqual('924');
  });

  it('should get fee amount from helix record', () => {
    const crab2CrabDVMSuccess = getFeeAmountFromHelixRecord(testRecords[0]);
    const crabDVM2HecoRefunded = getFeeAmountFromHelixRecord(testRecords[1]);
    const darwinia2CrabDVMSuccess = getFeeAmountFromHelixRecord(testRecords[2]);
    const crabDVM2CrabSuccess = getFeeAmountFromHelixRecord(testRecords[3]);
    const crabDVM2DarwiniaSuccess = getFeeAmountFromHelixRecord(testRecords[4]);
    const crabDVM2HecoSuccess = getFeeAmountFromHelixRecord(testRecords[5]);
    const crab2CrabParachainSuccess = getFeeAmountFromHelixRecord(testRecords[6]);

    expect(crab2CrabDVMSuccess).toEqual('0');
    expect(crabDVM2HecoRefunded).toEqual('0');
    expect(darwinia2CrabDVMSuccess).toEqual('40');
    expect(crabDVM2CrabSuccess).toEqual('0');
    expect(crabDVM2DarwiniaSuccess).toEqual('179.999999844');
    expect(crabDVM2HecoSuccess).toEqual('0.000000082182161332');
    expect(crab2CrabParachainSuccess).toEqual('100');
  });

  it('should get sent amount from helix record', () => {
    const crab2CrabDVMSuccess = getSentAmountFromHelixRecord(testRecords[0]);
    const crabDVM2HecoRefunded = getSentAmountFromHelixRecord(testRecords[1]);
    const darwinia2CrabDVMSuccess = getSentAmountFromHelixRecord(testRecords[2]);
    const crabDVM2CrabSuccess = getSentAmountFromHelixRecord(testRecords[3]);
    const crabDVM2DarwiniaSuccess = getSentAmountFromHelixRecord(testRecords[4]);
    const crabDVM2HecoSuccess = getSentAmountFromHelixRecord(testRecords[5]);
    const crab2CrabParachainSuccess = getSentAmountFromHelixRecord(testRecords[6]);

    expect(crab2CrabDVMSuccess).toEqual('1,190');
    expect(crabDVM2HecoRefunded).toEqual('140');
    expect(darwinia2CrabDVMSuccess).toEqual('50,000');
    expect(crabDVM2CrabSuccess).toEqual('0.999699485');
    expect(crabDVM2DarwiniaSuccess).toEqual('15,000');
    expect(crabDVM2HecoSuccess).toEqual('100.000000082182161332');
    expect(crab2CrabParachainSuccess).toEqual('1,024');
  });
});
