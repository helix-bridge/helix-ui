import { useEffect } from 'react';
import { CrossChainComponentProps, CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { useCheckSpecVersion } from '../../../hooks';
import { SubstrateDVMEthereumBridgeConfig } from './model';
import { SubstrateDVM2Ethereum } from './SubstrateDVM2Ethereum';

export function Ethereum2SubstrateDVM(
  props: CrossChainComponentProps<
    SubstrateDVMEthereumBridgeConfig,
    CrossToken<EthereumChainConfig>,
    CrossToken<DVMChainConfig>
  >
) {
  const { direction, setBridgeState } = props;
  const bridgeState = useCheckSpecVersion(direction);

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  return <SubstrateDVM2Ethereum {...props} />;
}
