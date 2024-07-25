import { arbitrumSepolia } from "../chains";
import { darwinia } from "../chains/darwinia";
import { ChainID, Network } from "../types";

export function getChains() {
  return [darwinia, arbitrumSepolia];
}

export function getChainByIdOrNetwork(chainIdOrNetwork: ChainID | Network | null | undefined) {
  switch (chainIdOrNetwork) {
    case ChainID.DARWINIA:
    case "darwinia-dvm":
      return darwinia;
    case ChainID.ARBITRUM_SEPOLIA:
    case "arbitrum-sepolia":
      return arbitrumSepolia;
  }
}
