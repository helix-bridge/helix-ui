import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const LnRelayersOverview = dynamic(() => import("@/components/lnrelayers-overview"));

export const metadata: Metadata = {
  title: "Relayers Overview - Helix Bridge",
  description: "All v2 version relayers of Helix Bridge",
};

export default function RelayerOverviewPage() {
  return (
    <PageWrap>
      <LnRelayersOverview bridgeVersion="lnv2" />
    </PageWrap>
  );
}
