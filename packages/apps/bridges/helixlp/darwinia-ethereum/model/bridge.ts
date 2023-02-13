import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type DarwiniaEthereumContractConfig = ContractConfig;

export type DarwiniaEthereumBridgeConfig = Required<BridgeConfig<DarwiniaEthereumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<DarwiniaEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<DarwiniaEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
