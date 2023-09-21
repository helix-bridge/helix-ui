import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/header";
import RainbowProvider from "@/providers/rainbow-provider";
import GraphqlProvider from "@/providers/graphql-provider";
import AppProvider from "@/providers/app-provider";

const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Helix",
  description: "helix bridge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="page-bg text-white">
      <body className={ibm_plex_sans.className}>
        <div className="relative min-h-screen">
          <GraphqlProvider>
            <RainbowProvider>
              <AppProvider>
                <Header />
                {children}
                <Footer />
              </AppProvider>
            </RainbowProvider>
          </GraphqlProvider>
        </div>
      </body>
    </html>
  );
}
