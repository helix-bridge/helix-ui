"use client";

import Tabs, { TabsProps } from "@/ui/tabs";
import { useState } from "react";

type TabKey = "all" | "pending" | "success" | "refunded";

export default function Records() {
  const [activeKey, setActiveKey] = useState<TabsProps<TabKey>["activeKey"]>("all");

  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={[
            {
              key: "all",
              label: <span>All</span>,
              children: <div>All</div>,
            },
            {
              key: "pending",
              label: <span>Pending</span>,
              children: <div>Pending</div>,
            },
            {
              key: "success",
              label: <span>Success</span>,
              children: <div>Success</div>,
            },
            {
              key: "refunded",
              label: <span>Refunded</span>,
              children: <div>Refunded</div>,
            },
          ]}
        />
      </div>
    </main>
  );
}
