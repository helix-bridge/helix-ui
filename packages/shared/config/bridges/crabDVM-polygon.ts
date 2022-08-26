import { crabDVMConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMPolygonBridgeConfig } from 'shared/model';

const crabDVMPolygonConfig: CrabDVMPolygonBridgeConfig = {
  contracts: {
    backing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    issuing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const crabDVMPolygon = new Bridge(crabDVMConfig, polygonConfig, crabDVMPolygonConfig, {
  name: 'crabDVM-polygon',
  category: 'cBridge',
});
