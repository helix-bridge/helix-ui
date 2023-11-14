import PageWrap from "@/components/page-wrap";
import TransferProvider from "@/providers/transfer-provider";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Transfer | Helix Bridge",
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
