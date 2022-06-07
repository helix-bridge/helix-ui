import { Bridge, EthereumDarwiniaBridgeConfig } from '../../model';
import { darwiniaConfig, ethereumConfig, pangolinConfig, ropstenConfig } from '../network';

const ethereumDarwiniaConfig: EthereumDarwiniaBridgeConfig = {
  api: { dapp: 'https://api.darwinia.network' },
  contracts: {
    fee: '0x6B0940772516B69088904564A56d09CFe6Bb3D85',
    issuing: '0xea7938985898af7fd945b03b7bc2e405e744e913',
    redeem: '0x5f44dd8e59f56aa04fe54e95cc690560ae706b18',
  },
  lockEvents: [
    {
      key: '0xf8860dda3d08046cf2706b92bf7202eaae7a79191c90e76297e0895605b8b457',
      max: 4344274,
      min: 0,
    },
    {
      key: '0x50ea63d9616704561328b9e0febe21cfae7a79191c90e76297e0895605b8b457',
      max: null,
      min: 4344275,
    },
  ],
};

/**
 * ethereum <-> darwinia
 */
export const ethereumDarwinia = new Bridge(ethereumConfig, darwiniaConfig, ethereumDarwiniaConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'ethereum-darwinia',
});

const ropstenDVMChainConfig: EthereumDarwiniaBridgeConfig = {
  api: { dapp: 'https://api.darwinia.network.l2me.com' },
  contracts: {
    fee: '0x6982702995b053A21389219c1BFc0b188eB5a372',
    issuing: '0x49262B932E439271d05634c32978294C7Ea15d0C',
    redeem: '0x98fAE9274562FE131e2CF5771ebFB0bB232aFd25',
  },
  lockEvents: [
    {
      key: '0x50ea63d9616704561328b9e0febe21cfae7a79191c90e76297e0895605b8b457',
      max: null,
      min: 0,
    },
  ],
};

/**
 * ethereum <-> darwinia testnet
 */
export const ropstenPangolin = new Bridge(ropstenConfig, pangolinConfig, ropstenDVMChainConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'ethereum-darwinia',
});
