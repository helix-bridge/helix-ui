"use client";

import LnRelayersOverview from "@/components/lnrelayers-overview";
import RelayerRegister from "@/components/relayer-register";
import RelayerRegisterV3 from "@/components/relayer-register-v3";
import RelayersManage from "@/components/relayers-manage";
import RelayerProvider from "@/providers/relayer-provider";
import RelayerProviderV3 from "@/providers/relayer-provider-v3";
import PageWrap from "@/ui/page-wrap";
import SegmentedTabs from "@/ui/segmented-tabs";
import VersionSwitch from "@/ui/version-switch";
import { Metadata } from "next";
import { useState } from "react";

type TabKey = "manage" | "register" | "overview";

export const metadata: Metadata = {
  title: "Relayer - Helix Bridge",
  description: "Secure, fast, and low-cost cross-chain crypto transfers.",
};

export default function RelayerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("manage");
  const [version, setVersion] = useState<"v2" | "v3">("v3");

  return (
    <PageWrap>
      <div className="flex flex-col items-center gap-5">
        <div className="flex w-full justify-end lg:w-[40rem]">
          <VersionSwitch value={version} onChange={setVersion} />
        </div>
        <SegmentedTabs
          activeKey={activeTab}
          options={[
            {
              key: "manage" as TabKey,
              label: "Manage",
              children:
                version === "v3" ? (
                  <RelayerProviderV3>
                    <RelayersManage bridgeVersion="lnv3" />
                  </RelayerProviderV3>
                ) : (
                  <RelayerProvider>
                    <RelayersManage bridgeVersion="lnv2" />
                  </RelayerProvider>
                ),
            },
            {
              key: "register" as TabKey,
              label: "Register",
              children:
                version === "v3" ? (
                  <RelayerProviderV3>
                    <RelayerRegisterV3 />
                  </RelayerProviderV3>
                ) : (
                  <RelayerProvider>
                    <RelayerRegister />
                  </RelayerProvider>
                ),
            },
            {
              key: "overview" as TabKey,
              label: "Overview",
              children: <LnRelayersOverview bridgeVersion={version === "v3" ? "lnv3" : "lnv2"} />,
            },
          ]}
          onChange={setActiveTab}
          className="lg:w-[40rem]"
          wrapClassName="w-full"
        />
      </div>
    </PageWrap>
  );
}
