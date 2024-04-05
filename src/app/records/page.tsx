import Footer from "@/components/footer";
import Header from "@/components/header";
import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const HistoryRecords = dynamic(() => import("@/components/history-records"));

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
