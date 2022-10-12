import {
  ParachainChain,
  PolkadotChain,
  DVMChain,
  EthereumChain,
  ParachainEthereumCompatibleChain,
} from 'shared/core/chain';
import {
  ChainConfig,
  ParachainChainConfig,
  PolkadotChainConfig,
  DVMChainConfig,
  EthereumChainConfig,
  ParachainEthereumCompatibleChainConfig,
} from 'shared/model';
import {
  isParachainNetwork,
  isPolkadotNetwork,
  isDVMNetwork,
  isParachainEthereumCompatibleNetwork,
} from 'shared/utils/network/network';

export const chainFactory = (conf: ChainConfig) => {
  if (isParachainEthereumCompatibleNetwork(conf)) {
    return new ParachainEthereumCompatibleChain(conf as ParachainEthereumCompatibleChainConfig);
  }

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
