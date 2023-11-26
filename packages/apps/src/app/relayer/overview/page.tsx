import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const LnRelayerOverview = dynamic(() => import("@/components/lnrelayer-overview"));

export const metadata: Metadata = {
  title: "Relayer Overview - Helix Bridge",
  description: "Overview all relayers on Helix Bridge",
};

export default function RelayerOverview() {
  return (
    <PageWrap>
      <LnRelayerOverview />
    </PageWrap>
  );
}
