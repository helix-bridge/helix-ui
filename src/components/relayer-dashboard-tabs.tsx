"use client";

import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import { useState } from "react";
import RelayerRegister from "./relayer-register";
import RelayersManage from "./relayers-manage";
import RelayerProvider from "@/providers/relayer-provider";
import { LnBridgeVersion } from "@/types";
import RelayerRegisterV3 from "./relayer-register-v3";
import RelayerProviderV3 from "@/providers/relayer-provider-v3";

type TabKey = "register" | "manage";

interface Props {
  bridgeVersion: LnBridgeVersion;
}

export default function RelayerDashboardTabs({ bridgeVersion }: Props) {
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("register");

  return (
    <SegmentedTabs
      options={[
        {
          key: "register",
          label: "Register",
          children:
            bridgeVersion === "lnv3" ? (
              <RelayerProviderV3>
                <RelayerRegisterV3 />
              </RelayerProviderV3>
            ) : (
              <RelayerProvider>
                <RelayerRegister />
              </RelayerProvider>
            ),
          disabled: false,
        },
        {
          key: "manage",
          label: "Manage",
          children:
            bridgeVersion === "lnv3" ? (
              <RelayerProviderV3>
                <RelayersManage bridgeVersion={bridgeVersion} />
              </RelayerProviderV3>
            ) : (
              <RelayerProvider>
                <RelayersManage bridgeVersion={bridgeVersion} />
              </RelayerProvider>
            ),
        },
      ]}
      className="lg:w-[40rem]"
      activeKey={activeKey}
      onChange={setActiveKey}
    />
  );
}
