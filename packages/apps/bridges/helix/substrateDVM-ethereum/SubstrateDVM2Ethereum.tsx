import { CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMEthereumBridge } from './utils/bridge';

export function SubstrateDVM2Ethereum(
  props: CrossChainComponentProps<
    SubstrateDVMEthereumBridge,
    CrossToken<EthereumChainConfig>,
    CrossToken<DVMChainConfig>
  >
) {
  return <Bridge {...props} hideRecipient />;
}
