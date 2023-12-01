import RecordDetail from "@/components/record-detail";
import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail - Helix Bridge",
  description: "View Helix Bridge transfer details",
};

interface Props {
  params: {
    id: string;
  };
}

export default function RecordPage({ params }: Props) {
  return (
    <PageWrap>
      <RecordDetail id={params.id} />
    </PageWrap>
  );
}
