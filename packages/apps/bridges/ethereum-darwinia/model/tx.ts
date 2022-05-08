import { CrossChainPayload, Bridge } from 'shared/model';
import { EthereumDarwiniaBridgeConfig } from './bridge';

export type TxPayload = CrossChainPayload<Bridge<EthereumDarwiniaBridgeConfig>>;
