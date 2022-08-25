import { Bridge, SubstrateSubstrateParachainBridgeConfig } from '../../model';
import { crabConfig, pangolinConfig } from '../network';
import { crabParachainConfig } from '../network/crab-parachain';
import { pangolinParachainConfig } from '../network/pangolin-parachain';

const crabCrabParachainConfig: SubstrateSubstrateParachainBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const crabCrabParachain = new Bridge<SubstrateSubstrateParachainBridgeConfig>(
  crabConfig,
  crabParachainConfig,
  crabCrabParachainConfig,
  {
    category: 'helix',
    activeArrivalConnection: true,
    name: 'substrate-substrateParachain',
  }
);

const pangolinPangolinParachainConfig: SubstrateSubstrateParachainBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const pangolinPangolinParachain = new Bridge<SubstrateSubstrateParachainBridgeConfig>(
  pangolinConfig,
  pangolinParachainConfig,
  pangolinPangolinParachainConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'substrate-substrateParachain' }
);
