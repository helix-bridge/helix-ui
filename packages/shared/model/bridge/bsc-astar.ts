import { BridgeConfig, CBridgeContractConfig } from 'shared/model';

type BSCAstarContractConfig = Required<CBridgeContractConfig>;

export type BSCAstarBridgeConfig = Required<BridgeConfig<BSCAstarContractConfig>>;
