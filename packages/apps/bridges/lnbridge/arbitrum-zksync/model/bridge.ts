import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ArbitrumZksyncContractConfig = ContractConfig;

export type ArbitrumZksyncBridgeConfig = Required<BridgeConfig<ArbitrumZksyncContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumZksyncBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumZksyncBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
