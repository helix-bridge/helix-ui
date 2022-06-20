export const CHAIN_TYPE = process.env.CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_TYPE;
export const ENV = process.env.NODE_ENV || process.env.REACT_APP_HOST_TYPE;
export const ENDPOINT = (process.env.ENDPOINT as string) || (process.env.NEXT_PUBLIC_ENDPOINT as string);

export const isFormalChain = CHAIN_TYPE === 'formal';
export const isDev = ENV === 'development';
export const isTestChainOrDevEnv = CHAIN_TYPE === 'test' || isDev;
export const isProd = !isDev;

export const SUBSTRATE_DVM_WITHDRAW = (process.env.SUBSTRATE_DVM_WITHDRAW ||
  process.env.NEXT_PUBLIC_SUBSTRATE_DVM_WITHDRAW) as string;

export const SUBSTRATE_PARACHAIN_BACKING = (process.env.SUBSTRATE_PARACHAIN_BACKING ||
  process.env.NEXT_PUBLIC_SUBSTRATE_PARACHAIN_BACKING) as string;

export const SUBSTRATE_PARACHAIN_BURN = (process.env.SUBSTRATE_PARACHAIN_BURN ||
  process.env.NEXT_PUBLIC_SUBSTRATE_PARACHAIN_BURN) as string;

console.log(
  '🚀 ~ file: env.ts ~ line 18 ~ SUBSTRATE_PARACHAIN_BURN',
  SUBSTRATE_PARACHAIN_BURN,
  SUBSTRATE_PARACHAIN_BACKING
);

console.log(`⛓️ Chains environment: ${CHAIN_TYPE}; 🖥️ Runtime environment: ${ENV}`);
