export function isMainnet() {
  return import.meta.env.VITE_NETWORK_TYPE === "mainnet";
}

export function isTestnet() {
  return import.meta.env.VITE_NETWORK_TYPE === "testnet";
}
