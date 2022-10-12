import { BridgeConfig, ContractConfig, CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type CrabParachainKaruraContractConfig = ContractConfig;

export type CrabParachainKaruraBridgeConfig = Required<BridgeConfig<CrabParachainKaruraContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainKaruraBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
