import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateParachainBridge } from './utils';

export function Substrate2SubstrateParachain(
  props: CrossChainComponentProps<
    SubstrateSubstrateParachainBridge,
    CrossToken<PolkadotChainConfig>,
    CrossToken<ParachainChainConfig>
  >
) {
  return <Bridge {...props} />;
}
