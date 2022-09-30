import { goerliConfig, pangoroDVMConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

const pangoroDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0xaafFbF487e9dA8429E2E9502d0907e5fD6b0C320',
    issuing: '0xfcAcf3d08275031e5Bd453Cf2509301290858984',
    guard: '0xB63846f957A97eC982b83Bb50957A519878196Ef',
  },
};

export const pangoroDVMGoerli = new BridgeBase(pangoroDVMConfig, goerliConfig, pangoroDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
