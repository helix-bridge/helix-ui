import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const RelayerDashboardTabs = dynamic(() => import("@/components/relayer-dashboard-tabs"), { ssr: false });

export const metadata: Metadata = {
  title: "Relayer Dashboard - Helix Bridge",
  description: "Registration and management of v2 relayer for Helix Bridge",
};

export default function RelayerDashboardPage() {
  return (
    <PageWrap>
      <RelayerDashboardTabs bridgeVersion="lnv2" />
    </PageWrap>
  );
}
