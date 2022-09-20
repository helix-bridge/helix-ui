import { goerliConfig, pangoroDVMConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

const pangoroDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0x7F9096beb4bAd82a63f4275d53c7E8EA03aC1C99',
    issuing: '0xe35b898A65c9868336bf34321373E1DA9401eB9d',
    guard: '0xd9C81baff337387F9c6C83507e85CEA0635618FE',
  },
};

export const pangoroDVMGoerli = new Bridge(pangoroDVMConfig, goerliConfig, pangoroDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
