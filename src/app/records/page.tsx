import Footer from "@/components/footer";
import Header from "@/components/header";
import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const HistoryRecords = dynamic(() => import("@/components/history-records"));

export const metadata: Metadata = {
  title: "Darwinia xToken - Helix Bridge",
  description: "Darwinia xToken cross-chain powered by Helix Bridge.",
};

export default function RecordsPage() {
  return (
    <>
      <Header />
      <PageWrap>
        <HistoryRecords />
      </PageWrap>
      <Footer />
    </>
  );
}
