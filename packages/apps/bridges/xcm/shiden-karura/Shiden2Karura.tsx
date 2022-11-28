import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ShidenKaruraBridge } from './utils';

export function Shiden2Karura(
  props: CrossChainComponentProps<ShidenKaruraBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} />;
}
