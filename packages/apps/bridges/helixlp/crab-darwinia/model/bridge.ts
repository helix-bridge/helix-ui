import { BridgeConfig, DVMChainConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type CrabDarwiniaContractConfig = ContractConfig;

export type CrabDarwiniaBridgeConfig = Required<BridgeConfig<CrabDarwiniaContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDarwiniaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDarwiniaBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
