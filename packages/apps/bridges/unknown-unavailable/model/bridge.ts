import { ContractConfig, BridgeConfig, Api, ApiKeys } from '../../../model';

interface UnknownUnavailableContractConfig extends ContractConfig {}

export type Unknown2UnavailableBridgeConfig = Required<BridgeConfig<UnknownUnavailableContractConfig, Api<ApiKeys>>>;
