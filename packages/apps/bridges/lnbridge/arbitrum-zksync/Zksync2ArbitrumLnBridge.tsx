import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ArbitrumZksyncBridge } from './utils/bridge';

export function Zksync2ArbitrumLnBridge(
  props: CrossChainComponentProps<ArbitrumZksyncBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
