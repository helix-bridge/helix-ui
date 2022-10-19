import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMInnerBridge } from './utils/bridge-inner';

export function SubstrateDVMInner(
  props: CrossChainComponentProps<SubstrateDVMInnerBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
