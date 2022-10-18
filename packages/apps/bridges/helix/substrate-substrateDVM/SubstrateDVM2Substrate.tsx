import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateDVMBridge } from './utils/bridge';

export function SubstrateDVM2Substrate(
  props: CrossChainComponentProps<
    SubstrateSubstrateDVMBridge,
    CrossToken<DVMChainConfig>,
    CrossToken<PolkadotChainConfig>
  >
) {
  return <Bridge {...props} />;
}
