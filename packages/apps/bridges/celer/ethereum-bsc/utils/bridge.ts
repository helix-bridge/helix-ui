import { bscConfig, ethereumConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumBSCConfig } from '../config';

export const ethereumBSC = new CBridgeBridge(ethereumConfig, bscConfig, ethereumBSCConfig, {
  name: 'ethereum-bsc',
  category: 'cBridge',
  issueCompName: 'Ethereum2BSC',
  redeemCompName: 'BSC2Ethereum',
});
