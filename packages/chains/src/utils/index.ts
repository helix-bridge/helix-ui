import { darwinia } from "../chains/darwinia";
import { ChainID, Network } from "../types";

export function getChains() {
  return [darwinia];
}

export function getChainByIdOrNetwork(chainIdOrNetwork: ChainID | Network | null | undefined) {
  switch (chainIdOrNetwork) {
    case ChainID.DARWINIA:
    case "darwinia-dvm":
      return darwinia;
  }
}
