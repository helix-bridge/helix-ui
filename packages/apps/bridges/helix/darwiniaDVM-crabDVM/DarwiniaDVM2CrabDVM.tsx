import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { DarwiniaDVMCrabDVMBridge } from './utils/bridge';

export function DarwiniaDVM2CrabDVM(
  props: CrossChainComponentProps<DarwiniaDVMCrabDVMBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
