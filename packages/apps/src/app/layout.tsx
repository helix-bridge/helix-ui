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
  title: "Helix Bridge",
  description: "Helix Bridge App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="page-bg text-white">
      <body className={ibm_plex_sans.className}>
        <GraphqlProvider>
          <RainbowProvider>
            <AppProvider>
              <Header />
              {children}
              <Footer />
            </AppProvider>
          </RainbowProvider>
        </GraphqlProvider>
      </body>
    </html>
  );
}
