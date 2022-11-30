import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { MoonriverShidenBridge } from './utils';

export function Shiden2Moonriver(
  props: CrossChainComponentProps<MoonriverShidenBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} />;
}
