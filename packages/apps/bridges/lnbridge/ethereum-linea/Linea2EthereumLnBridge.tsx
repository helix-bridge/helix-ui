import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { EthereumLineaBridge } from './utils/bridge';

export function Linea2EthereumLnBridge(
  props: CrossChainComponentProps<EthereumLineaBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
