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
import darwinDVMCrabDVMRecords from './fixture/darwin-dvm-crab-dvm.json';

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

    const darwinDVMCrabDVMSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getTokenConfigFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess?.symbol).toEqual('wRING');
    expect(crabDVM2DarwiniaDVMSuccess?.symbol).toEqual('xWRING');
  });

  it('should get received amount from helix record', () => {
    const crab2CrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('999');
    expect(crabDVM2CrabSuccess).toEqual('9,400');

    const crabDVM2HecoRefunded = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('233');
    expect(crabDVM2HecoSuccess).toEqual('299,320.96646407220857164');

    const darwinia2CrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('881');
    expect(crabDVM2DarwiniaSuccess).toEqual('1');

    const crab2CrabParachainSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('1,000');
    expect(crabParachain2CrabSuccess).toEqual('2');

    const darwinDVMCrabDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getReceivedAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('0.1013');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('0.1013');
  });

  it('should get sent amount from helix record', () => {
    const crab2CrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('999');
    expect(crabDVM2CrabSuccess).toEqual('9,400');

    const crabDVM2HecoRefunded = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('233');
    expect(crabDVM2HecoSuccess).toEqual('300,000');

    const darwinia2CrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('881');
    expect(crabDVM2DarwiniaSuccess).toEqual('1');

    const crab2CrabParachainSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('1,000');
    expect(crabParachain2CrabSuccess).toEqual('2');

    const darwinDVMCrabDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getSentAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('0.1013');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('0.1013');
  });

  it('should get fee amount from helix record', () => {
    const crab2CrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[0]);
    const crabDVM2CrabSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMRecords[1]);

    expect(crab2CrabDVMSuccess).toEqual('0');
    expect(crabDVM2CrabSuccess).toEqual('0');

    const crabDVM2HecoRefunded = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[0]);
    const crabDVM2HecoSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabDVMHecoRecords[1]);

    expect(crabDVM2HecoRefunded).toEqual('0');
    expect(crabDVM2HecoSuccess).toEqual('679.033535928');

    const darwinia2CrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[0]);
    const crabDVM2DarwiniaSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwiniaCrabDVMRecords[1]);

    expect(darwinia2CrabDVMSuccess).toEqual('39');
    expect(crabDVM2DarwiniaSuccess).toEqual('179');

    const crab2CrabParachainSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[0]);
    const crabParachain2CrabSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>crabCrabParachainRecords[1]);

    expect(crab2CrabParachainSuccess).toEqual('100');
    expect(crabParachain2CrabSuccess).toEqual('15');

    const darwinDVMCrabDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[0]);
    const crabDVM2DarwiniaDVMSuccess = getFeeAmountFromHelixRecord(<HelixHistoryRecord>darwinDVMCrabDVMRecords[1]);

    expect(darwinDVMCrabDVMSuccess).toEqual('39');
    expect(crabDVM2DarwiniaDVMSuccess).toEqual('225');
  });
});
