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

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const appName = "Helix Bridge";

const { tokens: _1, ...darwinia } = darwiniaChain;
const { tokens: _2, ...crab } = crabChain;

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
