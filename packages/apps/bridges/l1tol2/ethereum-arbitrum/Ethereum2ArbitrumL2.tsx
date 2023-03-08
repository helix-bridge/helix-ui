import { ChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { EthereumArbitrumBridgeL2 } from './utils/bridge';

export function Ethereum2ArbitrumL2(
  props: CrossChainComponentProps<EthereumArbitrumBridgeL2, CrossToken<ChainConfig>, CrossToken<ChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
