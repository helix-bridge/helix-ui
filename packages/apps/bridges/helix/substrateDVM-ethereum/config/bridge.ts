import { goerliConfig, pangoroDVMConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

const pangoroDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0x41073C282621590b731B69D7DEA9dE5557C22823',
    issuing: '0x1AECF62B14aC33929e74fc7939FA490b3B3E3563',
    guard: '0x6aa0e15E88A8EF584304Bb52c3E9C6fA16d3EAc5',
  },
};

export const pangoroDVMGoerli = new Bridge(pangoroDVMConfig, goerliConfig, pangoroDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
