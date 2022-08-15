import { crabDVMConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMAvalancheBridgeConfig } from 'shared/model';

const crabDVMAvalancheConfig: CrabDVMAvalancheBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
  },
};

export const crabDVMAvalanche = new Bridge(crabDVMConfig, avalancheConfig, crabDVMAvalancheConfig, {
  name: 'crabDVM-avalanche',
  category: 'cBridge',
});
