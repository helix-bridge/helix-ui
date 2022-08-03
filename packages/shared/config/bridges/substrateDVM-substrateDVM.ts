import { Bridge } from 'shared/model';
import { SubstrateDVMSubstrateDVMBridgeConfig } from 'shared/model';
import { pangoroDVMConfig, pangolinDVMConfig } from '../network';

const substrateDVMSubstrateDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    issuing: '0x91Cdd894aD5cC203A026115B33e30670E5166504',
    redeem: '0x0793e2726360224dA8cf781c048dF7acCa3Bb049',
  },
};

export const pangoroDVMPangolinDVM = new Bridge(pangoroDVMConfig, pangolinDVMConfig, substrateDVMSubstrateDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
});
