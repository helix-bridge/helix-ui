import {
  arbitrum,
  arbitrumSepolia,
  astarZkEVM,
  avalanche,
  base,
  baseSepolia,
  berachainTestnetbArtio,
  blast,
  bsc,
  crab,
  darwinia,
  mainnet,
  gnosis,
  linea,
  mantle,
  moonbeam,
  morph,
  morphHolesky,
  optimism,
  polygon,
  polygonZkEvm,
  scroll,
  sepolia,
  taikoHekla,
  zircuit,
  zircuitTestnet,
  zkSync,
  zksyncSepolia,
  celoAlfajores,
} from "../chains";
import { ChainID, type Network } from "../types";

export function getChains() {
  return [
    arbitrumSepolia,
    arbitrum,
    astarZkEVM,
    avalanche,
    baseSepolia,
    base,
    berachainTestnetbArtio,
    blast,
    bsc,
    crab,
    darwinia,
    mainnet,
    gnosis,
    linea,
    mantle,
    moonbeam,
    morphHolesky,
    optimism,
    polygonZkEvm,
    polygon,
    scroll,
    sepolia,
    taikoHekla,
    zksyncSepolia,
    zkSync,
    zircuit,
    zircuitTestnet,
    celoAlfajores,
  ];
}

export function getChainByIdOrNetwork(chainIdOrNetwork: ChainID | Network | null | undefined) {
  switch (chainIdOrNetwork) {
    case ChainID.ARBITRUM:
    case "arbitrum":
      return arbitrum;
    case ChainID.ARBITRUM_SEPOLIA:
    case "arbitrum-sepolia":
      return arbitrumSepolia;
    case ChainID.ASTAR_ZKEVM:
    case "astar-zkevm":
      return astarZkEVM;
    case ChainID.AVALANCHE:
    case "avalanche":
      return avalanche;
    case ChainID.BASE:
    case "base":
      return base;
    case ChainID.BASE_SEPOLIA:
    case "base-sepolia":
      return baseSepolia;
    case ChainID.BERA:
    case "bera":
      return berachainTestnetbArtio;
    case ChainID.BLAST:
    case "blast":
      return blast;
    case ChainID.BSC:
    case "bsc":
      return bsc;
    case ChainID.CRAB:
    case "crab-dvm":
      return crab;
    case ChainID.DARWINIA:
    case "darwinia-dvm":
      return darwinia;
    case ChainID.ETHEREUM:
    case "ethereum":
      return mainnet;
    case ChainID.GNOSIS:
    case "gnosis":
      return gnosis;
    case ChainID.LINEA:
    case "linea":
      return linea;
    case ChainID.MANTLE:
    case "mantle":
      return mantle;
    case ChainID.MOONBEAM:
    case "moonbeam":
      return moonbeam;
    case ChainID.MORPH:
    case "morph":
      return morph;
    case ChainID.MORPH_TESTNET:
    case "morph-testnet":
      return morphHolesky;
    case ChainID.OPTIMISM:
    case "op":
      return optimism;
    case ChainID.POLYGON:
    case "polygon":
      return polygon;
    case ChainID.SCROLL:
    case "scroll":
      return scroll;
    case ChainID.SEPOLIA:
    case "sepolia":
      return sepolia;
    case ChainID.TAIKO_HEKLA:
    case "taiko-hekla":
      return taikoHekla;
    case ChainID.ZKSYNC:
    case "zksync":
      return zkSync;
    case ChainID.ZKSYNC_SEPOLIA:
    case "zksync-sepolia":
      return zksyncSepolia;
    case ChainID.ZIRCUIT:
    case "zircuit":
      return zircuit;
    case ChainID.ZIRCUIT_SEPOLIA:
    case "zircuit-sepolia":
      return zircuitTestnet;
    case ChainID.CELO_TESTNET:
    case "celo-testnet":
      return celoAlfajores;
    default:
      return;
  }
}
