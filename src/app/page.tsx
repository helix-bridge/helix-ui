import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Transfer - Helix Bridge",
  description: "Secure, fast, and low-cost cross-chain crypto transfers.",
};

const TransferV2 = dynamic(() => import("@/components/transfer-v2"), { ssr: false });

export default function HomePage() {
  return (
    <PageWrap>
      <TransferV2 />
    </PageWrap>
  );
}
