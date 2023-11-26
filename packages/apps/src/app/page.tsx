import PageWrap from "@/ui/page-wrap";
import TransferProvider from "@/providers/transfer-provider";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Helix Bridge - Cross-chain for tokens",
  description: "Perform cross-chain transfers through Helix Bridge",
};

const Transfer = dynamic(() => import("@/components/transfer"), { ssr: false });

export default function Home() {
  return (
    <PageWrap>
      <TransferProvider>
        <Transfer />
      </TransferProvider>
    </PageWrap>
  );
}
