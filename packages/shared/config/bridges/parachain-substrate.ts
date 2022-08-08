import { Bridge, ParachainSubstrateBridgeConfig } from '../../model';
import { crabConfig, pangolinConfig } from '../network';
import { crabParachainConfig } from '../network/crab-parachain';
import { pangolinParachainConfig } from '../network/pangolin-parachain';

const parachainCrabConfig: ParachainSubstrateBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const parachainCrab = new Bridge<ParachainSubstrateBridgeConfig>(
  crabConfig,
  crabParachainConfig,
  parachainCrabConfig,
  {
    category: 'helix',
    activeArrivalConnection: true,
    name: 'parachain-substrate',
  }
);

const parachainPangolinConfig: ParachainSubstrateBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const parachainPangolin = new Bridge<ParachainSubstrateBridgeConfig>(
  pangolinConfig,
  pangolinParachainConfig,
  parachainPangolinConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'parachain-substrate' }
);
