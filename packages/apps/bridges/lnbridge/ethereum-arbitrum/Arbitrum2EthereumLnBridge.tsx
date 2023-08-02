import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { EthereumArbitrumBridge } from './utils/bridge';

export function Arbitrum2EthereumLnBridge(
  props: CrossChainComponentProps<EthereumArbitrumBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
