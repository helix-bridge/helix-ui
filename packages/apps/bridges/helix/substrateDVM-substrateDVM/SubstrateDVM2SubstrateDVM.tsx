import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMSubstrateDVMBridge } from './utils/bridge';

export function SubstrateDVM2SubstrateDVM(
  props: CrossChainComponentProps<
    SubstrateDVMSubstrateDVMBridge,
    CrossToken<DVMChainConfig>,
    CrossToken<DVMChainConfig>
  >
) {
  return <Bridge {...props} hideRecipient />;
}
