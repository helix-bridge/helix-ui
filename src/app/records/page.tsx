import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const Explorer = dynamic(() => import("@/components/explorer"));

export default function RecordsPage() {
  return (
    <PageWrap>
      <Explorer />
    </PageWrap>
  );
}
