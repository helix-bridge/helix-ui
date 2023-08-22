import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type EthereumLineaContractConfig = ContractConfig;

export type EthereumLineaBridgeConfig = Required<BridgeConfig<EthereumLineaContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumLineaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumLineaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
