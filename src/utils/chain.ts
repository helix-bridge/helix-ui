import {
  arbitrumChain,
  arbitrumSepoliaChain,
  baseChain,
  crabChain,
  darwiniaChain,
  ethereumChain,
  gnosisChain,
  lineaChain,
  mantleChain,
  pangolinChain,
  polygonChain,
  polygonZkEvmChain,
  scrollChain,
  sepoliaChain,
  zksyncChain,
  zksyncSepoliaChain,
} from "@/config/chains";
import { ChainConfig, ChainID, Network } from "@/types";
import { isProduction } from "./env";
import { bscChain } from "@/config/chains/bsc";
import { optimismChain } from "@/config/chains/optimism";

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
    case ChainID.ETHEREUM:
    case "ethereum":
      return ethereumChain;
    case ChainID.ARBITRUM:
    case "arbitrum":
      return arbitrumChain;
    case ChainID.ARBITRUM_SEPOLIA:
    case "arbitrum-sepolia":
      return arbitrumSepoliaChain;
    case ChainID.ZKSYNC:
    case "zksync":
      return zksyncChain;
    case ChainID.ZKSYNC_SEPOLIA:
    case "zksync-sepolia":
      return zksyncSepoliaChain;
    case ChainID.LINEA:
    case "linea":
      return lineaChain;
    case ChainID.MANTLE:
    case "mantle":
      return mantleChain;
    case ChainID.POLYGON:
    case "polygon":
      return polygonChain;
    case ChainID.POLYGON_ZKEVM:
    case "polygon-zkEvm":
      return polygonZkEvmChain;
    case ChainID.SCROLL:
    case "scroll":
      return scrollChain;
    case ChainID.BASE:
    case "base":
      return baseChain;
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
    arbitrumSepoliaChain,
    crabChain,
    darwiniaChain,
    ethereumChain,
    sepoliaChain,
    lineaChain,
    mantleChain,
    pangolinChain,
    zksyncChain,
    zksyncSepoliaChain,
    polygonChain,
    polygonZkEvmChain,
    scrollChain,
    baseChain,
    bscChain,
    optimismChain,
    gnosisChain,
  ].sort((a, b) => a.name.localeCompare(b.name));

  if (askAll) {
    return all;
  } else if (isProduction()) {
    return all.filter((c) => !c.hidden && !c.testnet);
  } else {
    return all.filter((c) => !c.hidden && !!c.testnet);
  }
}
