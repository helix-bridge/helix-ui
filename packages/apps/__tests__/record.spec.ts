/// <reference types="jest" />

import { HelixHistoryRecord } from 'shared/model';
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
import darwinDVMCrabDVMRecords from './fixture/darwin-dvm-crab-dvm.json';

describe('record utils', () => {
  it('should get token name from helix record', () => {
    const darwinDVMCrabDVMSuccess = getTokenConfigFromHelixRecord(
      <HelixHistoryRecord>darwinDVMCrabDVMRecords[0],
      'sendToken'
    );
    const crabDVM2DarwiniaDVMSuccess = getTokenConfigFromHelixRecord(
      <HelixHistoryRecord>darwinDVMCrabDVMRecords[1],
      'sendToken'
    );

    expect(darwinDVMCrabDVMSuccess?.symbol).toEqual('RING');
    expect(crabDVM2DarwiniaDVMSuccess?.symbol).toEqual('xWRING');
  });

  it('should get received amount from helix record', () => {
    const darwinDVMCrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('0.1013');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('0.1013');
  });

  it('should get sent amount from helix record', () => {
    const darwinDVMCrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('0.1013');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('0.1013');
  });

  it('should get fee amount from helix record', () => {
    const darwinDVMCrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('39');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('225');
  });
});
