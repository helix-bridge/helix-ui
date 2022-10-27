import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabDVMDarwiniaDVMBridge } from './utils';

export function CrabDVM2DarwiniaDVM(
  props: CrossChainComponentProps<CrabDVMDarwiniaDVMBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} />;
}
