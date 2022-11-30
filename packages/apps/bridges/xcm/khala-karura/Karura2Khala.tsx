import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { KhalaKaruraBridge } from './utils';

export function Karura2Khala(
  props: CrossChainComponentProps<KhalaKaruraBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} />;
}
