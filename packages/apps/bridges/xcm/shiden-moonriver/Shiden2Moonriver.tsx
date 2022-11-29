import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ShidenMoonriverBridge } from './utils';

export function Shiden2Moonriver(
  props: CrossChainComponentProps<ShidenMoonriverBridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} />;
}
