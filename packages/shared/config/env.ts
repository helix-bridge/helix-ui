export const CHAIN_TYPE = process.env.CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_TYPE;
export const ENV = process.env.NODE_ENV || process.env.REACT_APP_HOST_TYPE;

export const isFormalChain = CHAIN_TYPE === 'formal';
export const isTestChain = CHAIN_TYPE === 'test';
export const isDev = ENV === 'development';
export const isProd = !isDev;

console.log(`🎢 Chain env ${CHAIN_TYPE}; Runtime env ${ENV}`);
