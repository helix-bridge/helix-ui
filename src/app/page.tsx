import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const Transfer = dynamic(() => import("@/components/transfer"), { ssr: false });

export default function HomePage() {
  return (
    <PageWrap>
      <Transfer />
    </PageWrap>
  );
}
