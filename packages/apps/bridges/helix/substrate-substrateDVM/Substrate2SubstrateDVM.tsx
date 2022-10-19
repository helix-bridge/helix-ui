import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateDVMBridge } from './utils';

export function Substrate2SubstrateDVM(
  props: CrossChainComponentProps<
    SubstrateSubstrateDVMBridge,
    CrossToken<PolkadotChainConfig>,
    CrossToken<DVMChainConfig>
  >
) {
  return <Bridge {...props} />;
}
