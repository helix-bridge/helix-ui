"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, connectorsForWallets, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { imTokenWallet, okxWallet } from "@rainbow-me/rainbowkit/wallets";
import { PropsWithChildren } from "react";
import { mainnet, goerli, arbitrum, arbitrumGoerli, zkSync, zkSyncTestnet, linea, lineaTestnet } from "viem/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const appName = "Helix Bridge";

export default function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  const { chains, publicClient } = configureChains(
    [mainnet, goerli, arbitrum, arbitrumGoerli, zkSync, zkSyncTestnet, linea, lineaTestnet],
    [publicProvider()],
  );

  const { wallets } = getDefaultWallets({ appName, projectId, chains });

  const connectors = connectorsForWallets([
    ...wallets,
    {
      groupName: "More",
      wallets: [okxWallet({ projectId, chains }), imTokenWallet({ projectId, chains })],
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
