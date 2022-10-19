import { CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabParachainKaruraBridge } from './utils';

export function CrabParachain2Karura(
  props: CrossChainComponentProps<
    CrabParachainKaruraBridge,
    CrossToken<ParachainChainConfig>,
    CrossToken<ParachainChainConfig>
  >
) {
  return <Bridge {...props} />;
}
