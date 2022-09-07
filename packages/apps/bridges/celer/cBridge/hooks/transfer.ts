import { useMemo } from 'react';
import {
  BridgeConfig,
  CBridgeContractConfig,
  CrossChainDirection,
  CrossToken,
  EthereumChainConfig,
} from 'shared/model';
import { getBridge, isBSCAstar, isCrabDVMAstar, isCrabDVMEthereum, isEthereumAstar } from 'shared/utils/bridge';
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

  // eslint-disable-next-line complexity
  const info = useMemo(() => {
    const bridge = getBridge<Required<BridgeConfig<CBridgeContractConfig>>>(direction);
    const isIssue = bridge.isIssue(direction.from.meta, direction.to.meta);
    const { backing, issuing, stablecoinBacking, stablecoinIssuing, busdIssuing } = bridge.config.contracts;

    if (isStablecoin && isPegged) {
      const data = {
        sendTx: ['astar', 'crab-dvm'].includes(direction.from.host) ? burn : deposit,
        poolAddress: isIssue ? stablecoinBacking : stablecoinIssuing,
      };

      if (direction.from.symbol === 'BUSD' && direction.from.host === 'astar') {
        data.poolAddress = busdIssuing;
      }

      return data;
    }

    return { sendTx: transfer, poolAddress: isIssue ? backing : issuing };
  }, [direction, isPegged, isStablecoin]);

  return { isPegged, ...info };
}
