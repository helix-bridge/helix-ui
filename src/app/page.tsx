import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Helix Bridge - Cross-chain for tokens",
  description: "Perform cross-chain transfers through Helix Bridge",
};

const TransferV2 = dynamic(() => import("@/components/transfer-v2"), { ssr: false });

export default function HomePage() {
  return (
    <PageWrap>
      <TransferV2 />
    </PageWrap>
  );
}
