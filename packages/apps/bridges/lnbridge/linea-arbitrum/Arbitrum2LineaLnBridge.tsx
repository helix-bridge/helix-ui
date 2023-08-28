import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { LineaArbitrumBridge } from './utils/bridge';

export function Arbitrum2LineaLnBridge(
  props: CrossChainComponentProps<LineaArbitrumBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
