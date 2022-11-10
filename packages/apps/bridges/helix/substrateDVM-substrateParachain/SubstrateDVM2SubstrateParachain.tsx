import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMSubstrateParachainBridge } from './utils';

export function SubstrateDVM2SubstrateParachain(
  props: CrossChainComponentProps<
    SubstrateDVMSubstrateParachainBridge,
    CrossToken<ChainConfig>,
    CrossToken<ChainConfig>
  >
) {
  return <Bridge {...props} />;
}
