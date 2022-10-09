import { crabDVMConfig, ethereumConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { crabDVMEthereumConfig } from '../config';

export const crabDVMEthereum = new CBridgeBridge(crabDVMConfig, ethereumConfig, crabDVMEthereumConfig, {
  name: 'crabDVM-ethereum',
  category: 'cBridge',
});
