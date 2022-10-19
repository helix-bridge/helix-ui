import { CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabParachainMoonriverBridge } from './utils';

export function CrabParachain2Moonriver(
  props: CrossChainComponentProps<
    CrabParachainMoonriverBridge,
    CrossToken<ParachainChainConfig>,
    CrossToken<ParachainChainConfig>
  >
) {
  return <Bridge {...props} />;
}
