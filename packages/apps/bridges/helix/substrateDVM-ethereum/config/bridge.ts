import { darwiniaDVMConfig, ethereumConfig, goerliConfig, pangoroDVMConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

const darwiniaDVMEthereumConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xFBAD806Bdf9cEC2943be281FB355Da05068DE925',
    guard: '0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1',
  },
};

export const darwiniaDVMEthereum = new Bridge(darwiniaDVMConfig, ethereumConfig, darwiniaDVMEthereumConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});

const pangoroDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0xaafFbF487e9dA8429E2E9502d0907e5fD6b0C320',
    issuing: '0xfcAcf3d08275031e5Bd453Cf2509301290858984',
    guard: '0xB63846f957A97eC982b83Bb50957A519878196Ef',
  },
};

export const pangoroDVMGoerli = new Bridge(pangoroDVMConfig, goerliConfig, pangoroDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
