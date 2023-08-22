import { Network, NetworkThemeConfig } from '../model';
import dark from '../theme/antd/dark.json';
import light from '../theme/antd/light.json';
import vars from '../theme/antd/vars.json';
import crab from '../theme/network/crab.json';
import crabDark from '../theme/network/dark/crab.json';
import darwiniaDark from '../theme/network/dark/darwinia.json';
import pangolinDark from '../theme/network/dark/pangolin.json';
import pangoroDark from '../theme/network/dark/pangoro.json';
import darwinia from '../theme/network/darwinia.json';
import pangolin from '../theme/network/pangolin.json';
import pangoro from '../theme/network/pangoro.json';

export const NETWORK_LIGHT_THEME: NetworkThemeConfig<{ [key in keyof typeof darwinia]: string }> = {
  'crab-dvm': crab,
  'crab-parachain': crab,
  'darwinia-dvm': darwinia,
  'pangolin-dvm': pangolin,
  'pangolin-parachain': pangolin,
  'pangoro-dvm': pangoro,
  'arbitrum-goerli': pangolin,
  'zksync-goerli': pangolin,
  zksync: pangolin,
  arbitrum: pangolin,
  astar: pangolin,
  avalanche: pangolin,
  bsc: pangolin,
  crab,
  darwinia,
  ethereum: pangolin,
  heco: pangolin,
  karura: pangolin,
  moonriver: pangolin,
  optimism: pangolin,
  pangolin,
  pangoro,
  polkadot: pangolin,
  polygon: pangolin,
  ropsten: pangolin,
  goerli: pangolin,
  shiden: pangolin,
  khala: pangolin,
};

export const SKIN_THEME = {
  dark,
  light,
  vars,
};

export const NETWORK_DARK_THEME: NetworkThemeConfig<{ [key in keyof typeof darwiniaDark]: string }> = {
  'crab-dvm': crabDark,
  'crab-parachain': crabDark,
  'darwinia-dvm': darwiniaDark,
  'pangolin-dvm': pangolinDark,
  'pangolin-parachain': pangolinDark,
  'pangoro-dvm': pangoroDark,
  'arbitrum-goerli': pangolinDark,
  'zksync-goerli': pangolinDark,
  zksync: pangolinDark,
  arbitrum: pangolinDark,
  astar: pangolinDark,
  avalanche: pangolinDark,
  bsc: pangolinDark,
  crab: crabDark,
  darwinia: darwiniaDark,
  ethereum: pangolinDark,
  heco: pangolinDark,
  karura: crabDark,
  moonriver: pangoroDark,
  optimism: pangolinDark,
  pangolin: pangolinDark,
  pangoro: pangoroDark,
  polkadot: pangoroDark,
  polygon: pangolinDark,
  ropsten: pangolinDark,
  goerli: pangolinDark,
  shiden: pangoroDark,
  khala: pangoroDark,
};

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
}

export const chainColors: { [key in Network]: string } = {
  'crab-dvm': '#512dbc',
  'crab-parachain': '#512dbc',
  'darwinia-dvm': '#FF007A',
  'pangolin-dvm': '#3083dd',
  'pangolin-parachain': '#4b30dd',
  'pangoro-dvm': '#07488f',
  'arbitrum-goerli': '#2c384b',
  'zksync-goerli': '#2c384b',
  zksync: '#2c384b',
  arbitrum: '#2c384b',
  astar: '#1b8ff8',
  avalanche: '#e74140',
  bsc: '#ff4c3b',
  crab: '#512dbc',
  darwinia: '#FF007A',
  ethereum: '#1C87ED',
  heco: '#05933a',
  karura: '#512dbc',
  moonriver: '#0E132E',
  optimism: '#fe0421',
  pangolin: '#4b30dd',
  pangoro: '#07488f',
  polkadot: '#f19135',
  polygon: '#8447f3',
  ropsten: '#c6c6c6',
  goerli: '#c6c6c6',
  shiden: '#c6c6c6',
  khala: '#c6c6c6',
};