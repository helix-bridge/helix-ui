import { CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { KhalaShidenBridge } from './utils';

export function Shiden2Khala(
  props: CrossChainComponentProps<KhalaShidenBridge, CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
) {
  return <Bridge {...props} />;
}
