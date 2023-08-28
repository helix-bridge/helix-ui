import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ZksyncLineaContractConfig = ContractConfig;

export type ZksyncLineaBridgeConfig = Required<BridgeConfig<ZksyncLineaContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ZksyncLineaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ZksyncLineaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
