import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "History Records - Helix Bridge",
  description: "View the history of transfers via the Helix Bridge",
};

const HistoryRecords = dynamic(() => import("@/components/history-records"));

export default function RecordsPage() {
  return (
    <PageWrap>
      <HistoryRecords />
    </PageWrap>
  );
}
