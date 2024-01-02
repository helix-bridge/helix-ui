import {
  arbitrumChain,
  arbitrumGoerliChain,
  baseChain,
  baseGoerliChain,
  crabChain,
  darwiniaChain,
  ethereumChain,
  gnosisChain,
  goerliChain,
  lineaChain,
  lineaGoerliChain,
  mantleChain,
  mantleGoerliChain,
  mumbaiChain,
  pangolinChain,
  pangoroChain,
  polygonChain,
  polygonZkEvmChain,
  scrollChain,
  zksyncChain,
  zksyncGoerliChain,
} from "@/config/chains";
import { ChainConfig, ChainID, Network } from "@/types";
import { isProduction } from "./env";
import { bscChain } from "@/config/chains/bsc";
import { optimismChain } from "@/config/chains/optimism";
import { sepoliaChain } from "@/config/chains/sepolia";

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
    case ChainID.POLYGON_ZKEVM:
    case "polygon-zkEvm":
      return polygonZkEvmChain;
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
    case ChainID.BSC:
    case "bsc":
      return bscChain;
    case ChainID.OPTIMISM:
    case "op":
      return optimismChain;
    case ChainID.GNOSIS:
    case "gnosis":
      return gnosisChain;
    case ChainID.SEPOLIA:
    case "sepolia":
      return sepoliaChain;
    default:
      return;
  }
}

export function getChainConfigs(askAll?: boolean) {
  const all = [
    arbitrumChain,
    arbitrumGoerliChain,
    crabChain,
    darwiniaChain,
    ethereumChain,
    goerliChain,
    sepoliaChain,
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
    polygonZkEvmChain,
    scrollChain,
    baseChain,
    baseGoerliChain,
    bscChain,
    optimismChain,
    gnosisChain,
  ].sort((a, b) => a.name.localeCompare(b.name));

  if (askAll) {
    return all;
  } else if (isProduction()) {
    return all.filter((c) => (!c.hidden && !c.testnet) || c.network === "crab-dvm" || c.network === "sepolia");
  } else {
    return all.filter((c) => (!c.hidden && !!c.testnet) || c.network === "crab-dvm" || c.network === "sepolia");
  }
}
