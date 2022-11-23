import { ParachainChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ShidenKhalaBridge } from './utils';

export function Shiden2Khala(
  props: CrossChainComponentProps<ShidenKhalaBridge, CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
) {
  return <Bridge {...props} />;
}
