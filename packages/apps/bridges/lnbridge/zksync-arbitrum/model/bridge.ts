import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ZksyncArbitrumContractConfig = ContractConfig;

export type ZksyncArbitrumBridgeConfig = Required<BridgeConfig<ZksyncArbitrumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ZksyncArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ZksyncArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
