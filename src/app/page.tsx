import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const TransferV2 = dynamic(() => import("@/components/transfer-v2"), { ssr: false });

export default function HomePage() {
  return (
    <PageWrap>
      <TransferV2 />
    </PageWrap>
  );
}
