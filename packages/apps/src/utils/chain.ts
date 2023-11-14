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
import { ChainConfig, ChainID, Network } from "@/types/chain";
import { isProduction } from "./env";
import { polygonChain } from "@/config/chains/polygon";
import { mumbaiChain } from "@/config/chains/mumbai";
import { scrollChain } from "@/config/chains/scroll";
import { baseChain } from "@/config/chains/base";
import { baseGoerliChain } from "@/config/chains/base-goerli";

export function getChainConfig(chainIdOrNetwork?: ChainID | Network | null): ChainConfig | undefined {
  switch (chainIdOrNetwork) {
    case ChainID.DARWINIA:
    case "darwinia-dvm":
      return darwiniaChain;
    case ChainID.CRAB:
    case "crab-dvm":
      return crabChain;
    case ChainID.PANGOLIN:
    case "pangolin-dvm":
      return pangolinChain;
    case ChainID.PANGORO:
    case "pangoro-dvm":
      return pangoroChain;
    case ChainID.ETHEREUM:
    case "ethereum":
      return ethereumChain;
    case ChainID.GOERLI:
    case "goerli":
      return goerliChain;
    case ChainID.ARBITRUM:
    case "arbitrum":
      return arbitrumChain;
    case ChainID.ARBITRUM_GOERLI:
    case "arbitrum-goerli":
      return arbitrumGoerliChain;
    case ChainID.ZKSYNC:
    case "zksync":
      return zksyncChain;
    case ChainID.ZKSYNC_GOERLI:
    case "zksync-goerli":
      return zksyncGoerliChain;
    case ChainID.LINEA:
    case "linea":
      return lineaChain;
    case ChainID.LINEA_GOERLI:
    case "linea-goerli":
      return lineaGoerliChain;
    case ChainID.MANTLE:
    case "mantle":
      return mantleChain;
    case ChainID.MANTLE_GOERLI:
    case "mantle-goerli":
      return mantleGoerliChain;
    case ChainID.POLYGON:
    case "polygon":
      return polygonChain;
    case ChainID.MUMBAI:
    case "mumbai":
      return mumbaiChain;
    case ChainID.SCROLL:
    case "scroll":
      return scrollChain;
    case ChainID.BASE:
    case "base":
      return baseChain;
    case ChainID.BASE_GOERLI:
    case "base-goerli":
      return baseGoerliChain;
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
    mumbaiChain,
    polygonChain,
    scrollChain,
    baseChain,
    baseGoerliChain,
  ];

  if (isProduction()) {
    return all.filter((c) => !c.hidden && !c.testnet);
  } else {
    return all.filter((c) => !c.hidden && !!c.testnet);
  }
}
