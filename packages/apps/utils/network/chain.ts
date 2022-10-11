import { ParachainChain, PolkadotChain, DVMChain, EthereumChain } from 'shared/core/chain';
import {
  ChainConfig,
  ParachainChainConfig,
  PolkadotChainConfig,
  DVMChainConfig,
  EthereumChainConfig,
} from 'shared/model';
import { isParachainNetwork, isPolkadotNetwork, isDVMNetwork } from 'shared/utils/network/network';

export const toChain = (conf: ChainConfig) => {
  if (isParachainNetwork(conf)) {
    return new ParachainChain(conf as ParachainChainConfig);
  }

  if (isPolkadotNetwork(conf)) {
    return new PolkadotChain(conf as PolkadotChainConfig);
  }

  if (isDVMNetwork(conf)) {
    return new DVMChain(conf as DVMChainConfig);
  }

  return new EthereumChain(conf as EthereumChainConfig);
};
