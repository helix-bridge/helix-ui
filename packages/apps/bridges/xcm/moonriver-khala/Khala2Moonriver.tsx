import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { MoonriverKhalaBridge } from './utils';

export function Khala2Moonriver(
  props: CrossChainComponentProps<MoonriverKhalaBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} />;
}
