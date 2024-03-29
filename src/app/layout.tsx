import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/header";
import RainbowProvider from "@/providers/rainbow-provider";
import GraphqlProvider from "@/providers/graphql-provider";
import AppProvider from "@/providers/app-provider";
import TransferProvider from "@/providers/transfer-provider";

const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Helix xToken - Helix Bridge",
  description: "Helix Bridge for xToken cross-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ibm_plex_sans.className} bg-app-bg text-base font-normal text-white`}>
        <GraphqlProvider>
          <RainbowProvider>
            <AppProvider>
              <TransferProvider>
                <Header />
                {children}
                <Footer />
              </TransferProvider>
            </AppProvider>
          </RainbowProvider>
        </GraphqlProvider>
      </body>
    </html>
  );
}
