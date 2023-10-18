"use client";

import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import { useState } from "react";
import RelayerRegister from "./relayer-register";
import RelayersManage from "./relayers-manage";
import RelayerProvider from "@/providers/relayer-provider";

type TabKey = "register" | "manage";

export default function RelayerRegisterManage() {
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("register");

  return (
    <SegmentedTabs
      options={[
        {
          key: "register",
          label: "Register",
          children: (
            <RelayerProvider>
              <RelayerRegister />
            </RelayerProvider>
          ),
        },
        {
          key: "manage",
          label: "Manage",
          children: (
            <RelayerProvider>
              <RelayersManage />
            </RelayerProvider>
          ),
        },
      ]}
      className="lg:w-[38.75rem]"
      activeKey={activeKey}
      onChange={setActiveKey}
    />
  );
}
