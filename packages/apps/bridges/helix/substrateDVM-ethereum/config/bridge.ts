import { pangolinDVMConfig, goerliConfig, darwiniaDVMConfig, ethereumConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { SubstrateDVMEthereumBridgeConfig } from '../model';

export const pangolinDVMGoerliConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0xeAb1F01a8f4A2687023B159c2063639Adad5304E',
    issuing: '0x2a5fE3Cd11c6eEf7e3CeA26553e2694f0B0A9f9e',
    guard: '0x8C986EC362A38cA4A6a3fd4188C5318c689A187d',
  },
};

export const pangolinDVMGoerli = new BridgeBase(pangolinDVMConfig, goerliConfig, pangolinDVMGoerliConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});

export const darwiniaDVMEthereumConfig: SubstrateDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xFBAD806Bdf9cEC2943be281FB355Da05068DE925',
    guard: '0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1',
  },
};

export const darwiniaDVMEthereum = new BridgeBase(darwiniaDVMConfig, ethereumConfig, darwiniaDVMEthereumConfig, {
  name: 'substrateDVM-ethereum',
  category: 'helix',
});
