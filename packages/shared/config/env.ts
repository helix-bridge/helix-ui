export const CHAIN_TYPE = process.env.CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_TYPE;
export const ENV = process.env.NODE_ENV || process.env.REACT_APP_HOST_TYPE;
export const ENDPOINT = (process.env.ENDPOINT as string) || (process.env.NEXT_PUBLIC_ENDPOINT as string);
// exported on vercel config
export const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV || process.env.NEXT_PUBLIC_DEPLOYMENT_ENV;

// chain environments
export const isFormalChain = CHAIN_TYPE === 'formal';
export const isTestChain = CHAIN_TYPE === 'test';

/**
 * deployment environments
 * Since next.js cannot recognize custom environments, DEPLOYMENT_ENV is added to identify environments other than production and development environments
 */
export const isDev = ENV === 'development';
export const isProd = !isDev;
export const isStgDeployment = DEPLOYMENT_ENV === 'stg';
export const isDevDeployment = DEPLOYMENT_ENV === 'develop';
export const isProdDeployment = !!DEPLOYMENT_ENV && DEPLOYMENT_ENV !== 'stg' && DEPLOYMENT_ENV !== 'develop';

export const SUBSTRATE_DVM_WITHDRAW = (process.env.SUBSTRATE_DVM_WITHDRAW ||
  process.env.NEXT_PUBLIC_SUBSTRATE_DVM_WITHDRAW) as string;

export const SUBSTRATE_PARACHAIN_BACKING = (process.env.SUBSTRATE_PARACHAIN_BACKING ||
  process.env.NEXT_PUBLIC_SUBSTRATE_PARACHAIN_BACKING) as string;

export const SUBSTRATE_PARACHAIN_ISSUING = (process.env.SUBSTRATE_PARACHAIN_ISSUING ||
  process.env.NEXT_PUBLIC_SUBSTRATE_PARACHAIN_ISSUING) as string;

export const HELIX_DEPLOYMENT = (process.env.HELIX_DEPLOYMENT || process.env.NEXT_PUBLIC_HELIX_DEPLOYMENT) as string;
export const APPS_DEPLOYMENT = (process.env.APPS_DEPLOYMENT || process.env.NEXT_PUBLIC_APPS_DEPLOYMENT) as string;

console.log(`⛓️ Chains environment: ${CHAIN_TYPE}; 🖥️ Runtime environment: ${ENV}`);
