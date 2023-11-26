import PageWrap from "@/ui/page-wrap";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const RelayerRegisterManage = dynamic(() => import("@/components/relayer-register-manage"), { ssr: false });

export const metadata: Metadata = {
  title: "Relayer Dashboard - Helix Bridge",
  description: "Register a relayer on Helix Bridge or manage my relayers registered on Helix Bridge",
};

export default function MyRelayers() {
  return (
    <PageWrap>
      <RelayerRegisterManage />
    </PageWrap>
  );
}
