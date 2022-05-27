export const CHAIN_TYPE = process.env.CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_TYPE;
export const ENV = process.env.NODE_ENV || process.env.REACT_APP_HOST_TYPE;
export const ENDPOINT = (process.env.ENDPOINT as string) || (process.env.NEXT_PUBLIC_ENDPOINT as string);

export const isFormalChain = CHAIN_TYPE === 'formal';
export const isDev = ENV === 'development';
export const isTestChain = CHAIN_TYPE === 'test' || isDev;
export const isProd = !isDev;

console.log(`⛓️ Chains environment: ${CHAIN_TYPE}; 🖥️ Runtime environment: ${ENV}`);
