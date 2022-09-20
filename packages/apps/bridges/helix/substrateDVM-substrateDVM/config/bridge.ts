import { Bridge } from 'shared/model';
import { crabDVMConfig, darwiniaDVMConfig, pangolinDVMConfig, pangoroDVMConfig } from 'shared/config/network';
import { SubstrateDVMSubstrateDVMBridgeConfig } from '../model';

const darwiniaDVMcrabDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0xF3c1444CD449bD66Ef6DA7CA6c3E7884840A3995',
    issuing: '0x8738A64392b71617aF4C685d0E827855c741fDF7',
  },
};

export const darwiniaDVMCrabDVM = new Bridge(darwiniaDVMConfig, crabDVMConfig, darwiniaDVMcrabDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
});

export const darwiniaDVMDarwiniaDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0xE7578598Aac020abFB918f33A20faD5B71d670b4',
    issuing: '0xE7578598Aac020abFB918f33A20faD5B71d670b4',
  },
};

export const darwiniaDVMDarwiniaDVM = new Bridge(darwiniaDVMConfig, darwiniaDVMConfig, darwiniaDVMDarwiniaDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
  issueCompName: 'SubstrateDVMInner',
  redeemCompName: 'SubstrateDVMInner',
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

export const pangoroDVMPangoroDVMConfig: SubstrateDVMSubstrateDVMBridgeConfig = {
  contracts: {
    backing: '0x1977213Bb561d6e3bB07A9F22BCE758A14D7C693',
    issuing: '0x1977213Bb561d6e3bB07A9F22BCE758A14D7C693',
  },
};

export const pangoroDVMPangoroDVM = new Bridge(pangoroDVMConfig, pangoroDVMConfig, pangoroDVMPangoroDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
  issueCompName: 'SubstrateDVMInner',
  redeemCompName: 'SubstrateDVMInner',
});
