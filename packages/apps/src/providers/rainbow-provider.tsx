"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, connectorsForWallets, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { imTokenWallet, okxWallet, talismanWallet } from "@rainbow-me/rainbowkit/wallets";
import { PropsWithChildren } from "react";
import {
  mainnet,
  goerli,
  arbitrum,
  arbitrumGoerli,
  zkSync,
  zkSyncTestnet,
  linea,
  lineaTestnet,
  mantle,
  mantleTestnet,
} from "wagmi/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { darwiniaChain } from "@/config/chains/darwinia";
import { crabChain } from "@/config/chains/crab";
import { polygonChain } from "@/config/chains/polygon";
import { mumbaiChain } from "@/config/chains/mumbai";
import { scrollChain } from "@/config/chains/scroll";
import { baseChain } from "@/config/chains/base";
import { baseGoerliChain } from "@/config/chains/base-goerli";
import { bscChain } from "@/config/chains/bsc";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const appName = "Helix Bridge";

const { tokens: _1, ...darwinia } = darwiniaChain;
const { tokens: _2, ...crab } = crabChain;
const { tokens: _3, ...polygon } = polygonChain;
const { tokens: _4, ...mumbai } = mumbaiChain;
const { tokens: _5, ...scroll } = scrollChain;
const { tokens: _6, ...base } = baseChain;
const { tokens: _7, ...baseGoerli } = baseGoerliChain;
const { tokens: _8, ...bsc } = bscChain;

export default function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  const { chains, publicClient } = configureChains(
    [
      mainnet,
      goerli,
      arbitrum,
      arbitrumGoerli,
      zkSync,
      zkSyncTestnet,
      linea,
      lineaTestnet,
      mantle,
      mantleTestnet,
      darwinia,
      crab,
      polygon,
      mumbai,
      scroll,
      base,
      baseGoerli,
      bsc,
    ],
    [publicProvider()],
  );

  const { wallets } = getDefaultWallets({ appName, projectId, chains });

  const connectors = connectorsForWallets([
    ...wallets,
    {
      groupName: "More",
      wallets: [okxWallet({ projectId, chains }), imTokenWallet({ projectId, chains }), talismanWallet({ chains })],
    },
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        theme={darkTheme({ borderRadius: "small", accentColor: "#4BB1F8" })}
        chains={chains}
        appInfo={{ appName }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
