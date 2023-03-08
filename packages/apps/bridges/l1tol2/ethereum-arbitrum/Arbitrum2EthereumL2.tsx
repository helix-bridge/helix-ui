import { DVMChainConfig, CrossToken } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { EthereumArbitrumBridgeL2 } from './utils/bridge';

export function Arbitrum2EthereumL2(
  props: CrossChainComponentProps<EthereumArbitrumBridgeL2, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
