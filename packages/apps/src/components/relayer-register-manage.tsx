"use client";

import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import { useState } from "react";
import RelayerRegister from "./relayer-register";
import RelayersManage from "./relayers-manage";

type TabKey = "register" | "manage";

export default function RelayerRegisterManage() {
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("register");

  return (
    <SegmentedTabs
      options={[
        {
          key: "register",
          label: "Register",
          children: <RelayerRegister />,
        },
        {
          key: "manage",
          label: "Manage",
          children: <RelayersManage />,
        },
      ]}
      className="lg:w-[38.75rem]"
      activeKey={activeKey}
      onChange={setActiveKey}
    />
  );
}
