import { crabDVMConfig, bscConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMBscBridgeConfig } from 'shared/model';

const crabDVMBscConfig: CrabDVMBscBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
  },
};

export const crabDVMBsc = new Bridge(crabDVMConfig, bscConfig, crabDVMBscConfig, {
  name: 'crabDVM-bsc',
  category: 'cBridge',
});
