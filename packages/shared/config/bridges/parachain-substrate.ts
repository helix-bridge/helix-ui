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
  crabParachainConfig,
  crabConfig,
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
  pangolinParachainConfig,
  pangolinConfig,
  parachainPangolinConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'parachain-substrate' }
);
