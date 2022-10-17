import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateParachainBridge } from './utils';

export function SubstrateParachain2Substrate(
  props: CrossChainComponentProps<
    SubstrateSubstrateParachainBridge,
    CrossToken<ParachainChainConfig>,
    CrossToken<PolkadotChainConfig>
  >
) {
  return <Bridge {...props} />;
}
