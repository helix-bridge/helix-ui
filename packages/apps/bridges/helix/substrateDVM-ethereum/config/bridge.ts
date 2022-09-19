import { goerliConfig, pangoroDVMConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

const pangoroDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0x448ee34f0F552eAd97a1B63aD6da9734f555919A',
    issuing: '0x99EEC38BF4967BeA209B5A5D366aFB287722Ec69',
    guard: '0xCaaE893257366c866a82BAbDe85320b9123B829f',
  },
};

export const pangoroDVMGoerli = new Bridge(pangoroDVMConfig, goerliConfig, pangoroDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
