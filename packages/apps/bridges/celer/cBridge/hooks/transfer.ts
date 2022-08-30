import { useMemo } from 'react';
import { CrossChainDirection, CrossToken, EthereumChainConfig } from 'shared/model';
import {
  isBSCAstar,
  isCrabDVMAstar,
  isCrabDVMEthereum,
  isEthereum2CrabDVM,
  isEthereumAstar,
} from 'shared/utils/bridge';
import { burn, deposit, transfer } from '../utils';

export function useTransfer(
  direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
) {
  const isStablecoin = useMemo(() => {
    const stablecoin = ['USDT', 'USDC', 'BUSD'];

    return stablecoin.includes(direction.from.symbol);
  }, [direction.from.symbol]);

  const isPegged = useMemo(() => {
    const peggedFns = [isCrabDVMEthereum, isEthereumAstar, isCrabDVMAstar, isBSCAstar];

    return isStablecoin && peggedFns.some((fn) => fn(direction.from.host, direction.to.host));
  }, [direction.from.host, direction.to.host, isStablecoin]);

  const sendTx = useMemo(() => {
    if (isStablecoin) {
      if (direction.from.host === 'crab-dvm' || direction.from.host === 'astar') {
        return burn;
      } else if (isEthereum2CrabDVM(direction.from.host, direction.to.host)) {
        return deposit;
      }
    }

    return transfer;
  }, [direction.from.host, direction.to.host, isStablecoin]);

  return { isPegged, sendTx };
}
