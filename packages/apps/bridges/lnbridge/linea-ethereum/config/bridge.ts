import { lineaConfig, ethereumConfig, lineaGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { LineaEthereumBridgeConfig } from '../model';

const lineaEthereumConfig: LineaEthereumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const lineaGoerliGoerliConfig: LineaEthereumBridgeConfig = {
  contracts: {
    backing: '0x9C80EdD342b5D179c3a87946fC1F0963BfcaAa09',
    issuing: '0x91bdd735Dc214876605C18A57C7841CFF7eE959a',
  },
};

export const lineaEthereumLnBridge = new BridgeBase(lineaConfig, ethereumConfig, lineaEthereumConfig, {
  name: 'linea-ethereum',
  category: 'lnbridgev20-opposite',
});

export const lineaGoerliGoerliLnBridge = new BridgeBase(lineaGoerliConfig, goerliConfig, lineaGoerliGoerliConfig, {
  name: 'linea-ethereum',
  category: 'lnbridgev20-opposite',
});
