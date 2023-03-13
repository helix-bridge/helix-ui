import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ArbitrumEthereumBridge } from './utils/bridge';

export function Arbitrum2EthereumLn(
  props: CrossChainComponentProps<ArbitrumEthereumBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
