import { avalancheConfig, bscConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { bscAvalancheConfig } from '../config';

export const bscAvalanche = new CBridgeBridge(bscConfig, avalancheConfig, bscAvalancheConfig, {
  name: 'bsc-avalanche',
  category: 'cBridge',
  issueCompName: 'BSC2Avalanche',
  redeemCompName: 'Avalanche2BSC',
});
