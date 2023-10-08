import { arbitrumChain } from "@/config/chains/arbitrum";
import { arbitrumGoerliChain } from "@/config/chains/arbitrum-goerli";
import { crabChain } from "@/config/chains/crab";
import { darwiniaChain } from "@/config/chains/darwinia";
import { ethereumChain } from "@/config/chains/ethereum";
import { goerliChain } from "@/config/chains/goerli";
import { lineaChain } from "@/config/chains/linea";
import { lineaGoerliChain } from "@/config/chains/linea-goerli";
import { mantleChain } from "@/config/chains/mantle";
import { mantleGoerliChain } from "@/config/chains/mantle-goerli";
import { pangolinChain } from "@/config/chains/pangolin";
import { pangoroChain } from "@/config/chains/pangoro";
import { zksyncChain } from "@/config/chains/zksync";
import { zksyncGoerliChain } from "@/config/chains/zksync-goerli";
import { ChainConfig, Network } from "@/types/chain";
import { isProduction } from "./env";

export function getChainConfig(network?: Network | null): ChainConfig | undefined {
  switch (network) {
    case "darwinia-dvm":
      return darwiniaChain;
    case "crab-dvm":
      return crabChain;
    case "pangolin-dvm":
      return pangolinChain;
    case "pangoro-dvm":
      return pangoroChain;
    case "ethereum":
      return ethereumChain;
    case "goerli":
      return goerliChain;
    case "arbitrum":
      return arbitrumChain;
    case "arbitrum-goerli":
      return arbitrumGoerliChain;
    case "zksync":
      return zksyncChain;
    case "zksync-goerli":
      return zksyncGoerliChain;
    case "linea":
      return lineaChain;
    case "linea-goerli":
      return lineaGoerliChain;
    case "mantle":
      return mantleChain;
    case "mantle-goerli":
      return mantleGoerliChain;
    default:
      return;
  }
}

export function getChainsConfig() {
  const all = [
    arbitrumChain,
    arbitrumGoerliChain,
    crabChain,
    darwiniaChain,
    ethereumChain,
    goerliChain,
    lineaChain,
    lineaGoerliChain,
    mantleChain,
    mantleGoerliChain,
    pangolinChain,
    pangoroChain,
    zksyncChain,
    zksyncGoerliChain,
  ];

  if (isProduction()) {
    return all.filter((c) => !c.hidden && !c.testnet);
  } else {
    return all.filter((c) => !c.hidden && !!c.testnet);
  }
}
