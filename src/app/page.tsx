import { Metadata } from "next";
import dynamic from "next/dynamic";

const PageSelect = dynamic(() => import("@/components/page-select"), { ssr: false });

export const metadata: Metadata = {
  title: "Darwinia xToken - Helix Bridge",
  description: "Darwinia xToken cross-chain powered by Helix Bridge.",
};

export default function Home() {
  return <PageSelect />;
}
