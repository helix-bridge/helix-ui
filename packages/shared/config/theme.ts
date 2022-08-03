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
  crab,
  darwinia,
  pangolin,
  pangoro,
  ethereum: pangolin,
  ropsten: pangolin,
  heco: pangolin,
  polygon: pangolin,
  polkadot: pangolin,
  'pangolin-dvm': pangolin,
  'crab-dvm': crab,
  'pangolin-parachain': pangolin,
  'crab-parachain': crab,
  'pangoro-dvm': pangoro,
};

export const SKIN_THEME = {
  dark,
  light,
  vars,
};

export const NETWORK_DARK_THEME: NetworkThemeConfig<{ [key in keyof typeof darwiniaDark]: string }> = {
  crab: crabDark,
  darwinia: darwiniaDark,
  pangolin: pangolinDark,
  pangoro: pangoroDark,
  ethereum: pangolinDark,
  ropsten: pangolinDark,
  heco: pangolinDark,
  polygon: pangolinDark,
  polkadot: pangoroDark,
  'pangolin-dvm': pangolinDark,
  'crab-dvm': crabDark,
  'pangolin-parachain': pangolinDark,
  'crab-parachain': crabDark,
  'pangoro-dvm': pangoroDark,
};

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
}
