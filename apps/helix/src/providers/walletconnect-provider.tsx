import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { getChainConfigs } from "../utils";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { CaipNetwork, createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "";

// 2. Create a metadata object - optional
const metadata = {
  name: "Helix Bridge",
  description: "Secure, fast, and low-cost cross-chain crypto transfers",
  url: "https://helixbridge.app", // origin must match your domain & subdomain
  icons: ["https://helixbridge.app/pwa-512x512.png"],
};

// 3. Set the networks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const networks: CaipNetwork[] = getChainConfigs().map(({ tokens, ...chain }) => ({
  id: `eip155:${chain.id}`,
  chainId: chain.id,
  chainNamespace: "eip155",
  name: chain.name,
  currency: chain.nativeCurrency.symbol,
  explorerUrl: chain.blockExplorers?.default?.url || "",
  rpcUrl: chain.rpcUrls.default.http[0],
  imageUrl: chain.logo,
}));

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    socials: false,
    swaps: false,
    onramp: false,
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#0085FF",
  },
});

export default function WalletConnectProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
