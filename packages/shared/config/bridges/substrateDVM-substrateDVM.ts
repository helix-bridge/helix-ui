import { Bridge } from 'shared/model';
import { SubstrateDVMSubstrateDVMBridgeConfig } from 'shared/model';
import { pangoroDVMConfig, pangolinDVMConfig, darwiniaDVMConfig, crabDVMConfig } from '../network';

const darwiniaDVMcrabDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0x1d28f50ee65E5C830e218550D751F8bAA3ae0009',
    issuing: '0x5E3aF26C8ca071302D00A0f8CcC05E401D22843f',
  },
};

export const darwiniaDVMCrabDVM = new Bridge(darwiniaDVMConfig, crabDVMConfig, darwiniaDVMcrabDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
  disableIssuing: false,
  disableRedeem: false,
});

const pangoroDVMpangolinDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0x91Cdd894aD5cC203A026115B33e30670E5166504',
    issuing: '0x0793e2726360224dA8cf781c048dF7acCa3Bb049',
  },
};

export const pangoroDVMPangolinDVM = new Bridge(pangoroDVMConfig, pangolinDVMConfig, pangoroDVMpangolinDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
});
