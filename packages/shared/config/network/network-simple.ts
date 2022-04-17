/* -------------------------------------------------Network Simple-------------------------------------------------------- */

interface NetworkSimpleInfo {
  prefix: number;
  network?: string;
  hasLink?: boolean;
  name?: string;
}

const networkSimple: Record<string, NetworkSimpleInfo> = {
  acala: {
    hasLink: true,
    name: 'Acala Mandala',
    network: 'acala-testnet',
    prefix: 42,
  },
  'acala mainnet': {
    prefix: 10,
  },
  alphaville: {
    prefix: 25,
  },
  ares: {
    prefix: 34,
  },
  aventus: {
    prefix: 65,
  },
  basilisk: {
    prefix: 10041,
  },
  bifrost: {
    hasLink: true,
    network: 'bifrost',
    prefix: 6,
  },
  calamari: {
    prefix: 78,
  },
  chainx: {
    hasLink: true,
    network: 'chainx',
    prefix: 44,
  },
  clover: {
    hasLink: true,
    network: 'clover',
    prefix: 42,
  },
  'clover-testnet': {
    hasLink: true,
    network: 'clover-testnet',
    prefix: 42,
  },
  cord: {
    prefix: 29,
  },
  crab: {
    hasLink: true,
    network: 'crab',
    prefix: 42,
  },
  crust: {
    hasLink: true,
    network: 'crust',
    prefix: 42,
  },
  'crust mainnet': {
    prefix: 66,
  },
  dark: {
    prefix: 17,
  },
  darwinia: {
    hasLink: true,
    network: 'darwinia',
    prefix: 18,
  },
  datahighway: {
    hasLink: true,
    network: 'datahighway',
    prefix: 33,
  },
  'datahighway-harbour': {
    hasLink: true,
    network: 'datahighway-harbour',
    prefix: 42,
  },
  dbc: {
    hasLink: true,
    network: 'dbc',
    prefix: 42,
  },
  dock: {
    hasLink: true,
    network: 'dock',
    prefix: 22,
  },
  'dock testnet': {
    prefix: 21,
  },
  ed25519: {
    prefix: 3,
  },
  edgeware: {
    hasLink: true,
    network: 'edgeware',
    prefix: 7,
  },
  equilibrium: {
    hasLink: true,
    network: 'equilibrium',
    prefix: 67,
  },
  gateway: {
    hasLink: true,
    network: 'gateway-testnet',
    prefix: 42,
  },
  geek: {
    prefix: 19,
  },
  hydradx: {
    prefix: 63,
  },
  jupiter: {
    prefix: 26,
  },
  karura: {
    hasLink: true,
    network: 'karura',
    prefix: 8,
  },
  katalchain: {
    prefix: 4,
  },
  kilt: {
    hasLink: true,
    name: 'kilt-testnet',
    network: 'kilt-testnet',
    prefix: 38,
  },
  kulupu: {
    hasLink: true,
    network: 'kulupu',
    prefix: 16,
  },
  kusama: {
    hasLink: true,
    network: 'kusama',
    prefix: 2,
  },
  laminar: {
    hasLink: true,
    network: 'laminar-testnet',
    prefix: 42,
  },
  'laminar mainnet': {
    prefix: 11,
  },
  litentry: {
    network: 'litentry', // hasLink: true,
    prefix: 31,
  },
  manta: {
    hasLink: true,
    network: 'manta-testnet',
    prefix: 77,
  },
  moonbean: {
    prefix: 1284,
  },
  moonriver: {
    prefix: 1285,
  },
  neatcoin: {
    prefix: 48,
  },
  nodle: {
    prefix: 37,
  },
  pangolin: {
    hasLink: true,
    network: 'pangolin',
    prefix: 18,
  },
  patract: {
    prefix: 27,
  },
  phala: {
    hasLink: true,
    network: 'phala',
    prefix: 42,
  },
  'phala mainnet': {
    prefix: 30,
  },
  plasm: {
    hasLink: true,
    network: 'plasm',
    prefix: 5,
  },
  poli: {
    prefix: 41,
  },
  polkadot: {
    hasLink: true,
    network: 'polkadot',
    prefix: 0,
  },
  polymath: {
    prefix: 12,
  },
  reynolds: {
    prefix: 9,
  },
  robonomics: {
    prefix: 32,
  },
  rococo: {
    hasLink: true,
    network: 'rococo',
    prefix: 42,
  },
  secp256k1: {
    prefix: 43,
  },
  shift: {
    prefix: 23,
  },
  'social-network': {
    prefix: 252,
  },
  sora: {
    network: 'sora', // hasLink: true,
    prefix: 69,
  },
  sr25519: {
    prefix: 1,
  },
  subsocial: {
    prefix: 28,
  },
  substrate: {
    prefix: 42,
  },
  substratee: {
    prefix: 13,
  },
  synesthesia: {
    prefix: 15,
  },
  totem: {
    prefix: 14,
  },
  uniarts: {
    prefix: 45,
  },
  vln: {
    prefix: 35,
  },
  westend: {
    hasLink: true,
    network: 'westend',
    prefix: 42,
  },
  zero: {
    prefix: 24,
  },
};

export const NETWORK_SIMPLE: Required<NetworkSimpleInfo>[] = Object.entries(networkSimple).map(([key, value]) => ({
  network: key,
  name: value.name || value.network || key,
  hasLink: !!value.hasLink,
  prefix: value.prefix,
}));
