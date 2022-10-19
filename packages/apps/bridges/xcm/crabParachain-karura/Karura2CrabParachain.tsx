import { CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabParachainKaruraBridge } from './utils';

export function Karura2CrabParachain(
  props: CrossChainComponentProps<
    CrabParachainKaruraBridge,
    CrossToken<ParachainChainConfig>,
    CrossToken<ParachainChainConfig>
  >
) {
  return <Bridge {...props} />;
}
