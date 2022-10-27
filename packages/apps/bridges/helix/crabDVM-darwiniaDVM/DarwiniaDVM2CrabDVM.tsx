import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabDVMDarwiniaDVMBridge } from './utils';

export function DarwiniaDVM2CrabDVM(
  props: CrossChainComponentProps<CrabDVMDarwiniaDVMBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
