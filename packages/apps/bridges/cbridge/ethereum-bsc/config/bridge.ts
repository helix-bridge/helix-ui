import { ethereumConfig, bscConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { EthereumBSCBridgeConfig } from '../model';

const ethereumBSCConfig: EthereumBSCBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    stablecoinBacking: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const ethereumBSC = new BridgeBase(ethereumConfig, bscConfig, ethereumBSCConfig, {
  name: 'ethereum-bsc',
  category: 'cBridge',
  issueCompName: 'Ethereum2BSC',
  redeemCompName: 'BSC2Ethereum',
});
