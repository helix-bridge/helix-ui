import { NetworkThemeConfig } from '../model';
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
  'BNB Chain': pangolin,
  'crab-dvm': crab,
  'crab-parachain': crab,
  'darwinia-dvm': darwinia,
  'pangolin-dvm': pangolin,
  'pangolin-parachain': pangolin,
  'pangoro-dvm': pangoro,
  arbitrum: pangolin,
  astar: pangolin,
  avalanche: pangolin,
  crab,
  darwinia,
  ethereum: pangolin,
  heco: pangolin,
  optimism: pangolin,
  pangolin,
  pangoro,
  polkadot: pangolin,
  polygon: pangolin,
  ropsten: pangolin,
};

export const SKIN_THEME = {
  dark,
  light,
  vars,
};

export const NETWORK_DARK_THEME: NetworkThemeConfig<{ [key in keyof typeof darwiniaDark]: string }> = {
  'BNB Chain': pangolinDark,
  'crab-dvm': crabDark,
  'crab-parachain': crabDark,
  'darwinia-dvm': darwiniaDark,
  'pangolin-dvm': pangolinDark,
  'pangolin-parachain': pangolinDark,
  'pangoro-dvm': pangoroDark,
  arbitrum: pangolinDark,
  astar: pangolinDark,
  avalanche: pangolinDark,
  crab: crabDark,
  darwinia: darwiniaDark,
  ethereum: pangolinDark,
  heco: pangolinDark,
  optimism: pangolinDark,
  pangolin: pangolinDark,
  pangoro: pangoroDark,
  polkadot: pangoroDark,
  polygon: pangolinDark,
  ropsten: pangolinDark,
};

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
}
