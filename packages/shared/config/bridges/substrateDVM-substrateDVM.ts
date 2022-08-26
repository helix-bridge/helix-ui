import { Bridge } from 'shared/model';
import { SubstrateDVMSubstrateDVMBridgeConfig } from 'shared/model';
import { pangoroDVMConfig, pangolinDVMConfig, darwiniaDVMConfig, crabDVMConfig } from '../network';

const darwiniaDVMcrabDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0x286C8df631D74F5dcE04424c0d6558Bc87F90045',
    issuing: '0x1eA414A1B969CF50402FC8BB4C02888D581804cD',
  },
};

export const darwiniaDVMCrabDVM = new Bridge(darwiniaDVMConfig, crabDVMConfig, darwiniaDVMcrabDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
  disableIssuing: true,
  disableRedeem: true,
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
