import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { ZksyncLineaBridge } from './utils/bridge';

export function Linea2ZksyncLnBridge(
  props: CrossChainComponentProps<ZksyncLineaBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
) {
  return <Bridge {...props} hideRecipient />;
}
