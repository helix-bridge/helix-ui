import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMBridge } from './utils';

export function Substrate2DVM(
  props: CrossChainComponentProps<SubstrateDVMBridge, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} />;
}
