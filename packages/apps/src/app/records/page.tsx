import HistoryRecords from "@/components/history-records";
import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "History Records - Helix Bridge",
  description: "View the history of transfers via the Helix Bridge",
};

export default function Records() {
  return (
    <PageWrap>
      <HistoryRecords />
    </PageWrap>
  );
}
