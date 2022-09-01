import { useMemo } from 'react';
import { CrossChainDirection, CrossToken, EthereumChainConfig } from 'shared/model';
import { isBSCAstar, isCrabDVMAstar, isCrabDVMEthereum, isEthereumAstar } from 'shared/utils/bridge';
import { burn, deposit, transfer } from '../utils';

export function useTransfer(
  direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
) {
  const isStablecoin = useMemo(() => {
    const stablecoin = ['USDT', 'USDC', 'BUSD'];

    return stablecoin.includes(direction.from.symbol);
  }, [direction.from.symbol]);

  const isPegged = useMemo(() => {
    const peggedFns = [isCrabDVMEthereum, isEthereumAstar, isCrabDVMAstar];

    if (!isStablecoin) {
      return false;
    }

    if (peggedFns.some((fn) => fn(direction.from.host, direction.to.host))) {
      return true;
    }

    if (isBSCAstar(direction.from.host, direction.to.host) && direction.from.symbol === 'BUSD') {
      return true;
    }

    return false;
  }, [direction.from.symbol, direction.from.host, direction.to.host, isStablecoin]);

  const sendTx = useMemo(() => {
    if (isStablecoin && isPegged) {
      if (direction.from.host === 'astar' || direction.from.host === 'crab-dvm') {
        return burn;
      } else {
        return deposit;
      }
    }

    return transfer;
  }, [direction.from.host, isStablecoin, isPegged]);

  return { isPegged, sendTx };
}
