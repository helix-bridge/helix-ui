import { crabDVMConfig, darwiniaDVMConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { CrabDarwiniaBridgeConfig } from '../model';

const crabDarwiniaConfig: CrabDarwiniaBridgeConfig = {
  contracts: {
    backing: '0x0C2E72C10D2db4BD00960151B114d56E2a2daEc7',
    issuing: '0x71388920e33021E871b322a50859691a3332A5a3',
  },
};

export const crabDarwinia = new BridgeBase(crabDVMConfig, darwiniaDVMConfig, crabDarwiniaConfig, {
  name: 'crab-darwinia',
  category: 'helixLpBridge',
  isDefault: true,
});
