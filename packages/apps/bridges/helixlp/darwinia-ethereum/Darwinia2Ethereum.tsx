import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { DarwiniaEthereumBridge } from './utils/bridge';

export function Darwinia2Ethereum(
  props: CrossChainComponentProps<DarwiniaEthereumBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
