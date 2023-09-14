"use client";

import { QUERY_RECORDS } from "@/config";
import { RecordStatus, RecordsResponseData, RecordsVariables, UrlSearchParam } from "@/types";
import Tabs, { TabsProps } from "@/ui/tabs";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import RecordsTable from "@/components/records-table";

enum AllStatus {
  All = -1,
}
type TabKey = RecordStatus | AllStatus;

const pageSize = 10;

export default function Records() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<TabsProps<TabKey>["activeKey"]>(AllStatus.All);
  const [currentPagge, setCurrentPage] = useState(0);

  const {
    loading,
    data: records,
    refetch,
  } = useQuery<RecordsResponseData, RecordsVariables>(QUERY_RECORDS, {
    variables: {
      row: pageSize,
      page: currentPagge,
      sender: searchParams.get(UrlSearchParam.Address) || undefined,
      recipient: searchParams.get(UrlSearchParam.Address) || undefined,
      results: activeKey === AllStatus.All ? undefined : [activeKey],
    },
  });

  const createChildren = () => (
    <RecordsTable
      // dataSource={[]}
      dataSource={(records?.historyRecords?.records || []).map((r) => ({ ...r, key: r.id }))}
      // loading={true}
      loading={loading}
      total={records?.historyRecords?.total}
      pageSize={pageSize}
      currentPage={currentPagge}
      onPageChange={setCurrentPage}
      onRowClick={(_, { id }) => router.push(`${pathName}/${id}`)}
    />
  );

  return (
    <main className="app-main">
      <div className="px-middle container mx-auto py-5">
        <Tabs
          items={[
            {
              key: AllStatus.All,
              label: <span>All</span>,
              children: createChildren(),
            },
            {
              key: RecordStatus.Pending,
              label: <span>Pending</span>,
              children: createChildren(),
            },
            {
              key: RecordStatus.Success,
              label: <span>Success</span>,
              children: createChildren(),
            },
            {
              key: RecordStatus.Refunded,
              label: <span>Refunded</span>,
              children: createChildren(),
            },
          ]}
          activeKey={activeKey}
          onChange={setActiveKey}
        />
      </div>
    </main>
  );
}
