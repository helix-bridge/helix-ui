import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ZksyncEthereumContractConfig = ContractConfig;

export type ZksyncEthereumBridgeConfig = Required<BridgeConfig<ZksyncEthereumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ZksyncEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ZksyncEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
