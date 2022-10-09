import { bscConfig, optimismConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { bscOptimismConfig } from '../config';

export const bscOptimism = new CBridgeBridge(bscConfig, optimismConfig, bscOptimismConfig, {
  name: 'bsc-optimism',
  category: 'cBridge',
  issueCompName: 'BSC2Optimism',
  redeemCompName: 'Optimism2BSC',
});
