import RecordDetail from "@/components/record-detail";
import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail - Helix Bridge",
  description: "View Helix Bridge transfer details",
};

export default function RecordPage() {
  return (
    <PageWrap>
      <RecordDetail />
    </PageWrap>
  );
}
