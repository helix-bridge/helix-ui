import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { DarwiniaDVMInnerBridge } from './utils/bridge-inner';

export function DarwiniaDVMInner(
  props: CrossChainComponentProps<DarwiniaDVMInnerBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
