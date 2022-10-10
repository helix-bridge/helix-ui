import { BridgeConfig } from 'shared/model';
import { CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig, 'contracts'>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
