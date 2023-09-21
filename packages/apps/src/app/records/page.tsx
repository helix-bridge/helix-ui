"use client";

import { QUERY_RECORDS } from "@/config/gql";
import { RecordStatus, RecordsResponseData, RecordsVariables } from "@/types/graphql";
import Tabs, { TabsProps } from "@/ui/tabs";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import RecordsTable from "@/components/records-table";
import { UrlSearchParam } from "@/types/url";
import SearchInput from "@/ui/search-input";
import { isAddress } from "viem";
import CountdownRefresh from "@/ui/countdown-refresh";

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
  const [records, setRecords] = useState<RecordsResponseData>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState(searchParams.get(UrlSearchParam.Address) || "");
  const deferredSearchValue = useDeferredValue(searchValue);

  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { loading, data, networkStatus, refetch } = useQuery<RecordsResponseData, RecordsVariables>(QUERY_RECORDS, {
    variables: {
      row: pageSize,
      page: currentPage,
      sender: deferredSearchValue.toLowerCase(),
      recipient: deferredSearchValue.toLowerCase(),
      results:
        activeKey === AllStatus.All
          ? undefined
          : activeKey === RecordStatus.Pending
          ? [RecordStatus.Pending, RecordStatus.PendingToRefund, RecordStatus.PendingToClaim]
          : [activeKey],
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // better user experience
    if (!loading) {
      setRecords(data);
    }
  }, [loading, data]);

  const createChildren = () => (
    <RecordsTable
      dataSource={(records?.historyRecords?.records || []).map((r) => ({ ...r, key: r.id }))}
      loading={
        networkStatus === NetworkStatus.loading ||
        networkStatus === NetworkStatus.setVariables ||
        (networkStatus === NetworkStatus.refetch && isManualRefresh)
      }
      total={records?.historyRecords?.total}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onRowClick={(_, { id }) => router.push(`${pathName}/${id}`)}
    />
  );

  return (
    <main className="app-main">
      <div className="px-middle container mx-auto py-5">
        <div className="flex items-center justify-between gap-5">
          <SearchInput
            placeholder="Search by address"
            className="w-full lg:w-[26.5rem]"
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value);

              const params = new URLSearchParams(searchParams.toString());
              if (isAddress(value)) {
                params.set(UrlSearchParam.Address, value);
                router.push(`?${params.toString()}`);
              } else if (params.has(UrlSearchParam.Address)) {
                params.delete(UrlSearchParam.Address);
                router.push(`?${params.toString()}`);
              }
            }}
            onReset={() => {
              setSearchValue("");

              const params = new URLSearchParams(searchParams.toString());
              if (params.has(UrlSearchParam.Address)) {
                params.delete(UrlSearchParam.Address);
                router.push(`?${params.toString()}`);
              }
            }}
          />

          <CountdownRefresh
            isActive={networkStatus === NetworkStatus.ready}
            onClick={() => {
              setIsManualRefresh(true);
              setTimeout(() => refetch(), 0);
            }}
            onRefresh={() => {
              setIsManualRefresh(false);
              setTimeout(() => refetch(), 0);
            }}
          />
        </div>

        <Tabs
          className="mt-5"
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
          onChange={(key) => {
            setRecords(undefined);
            setCurrentPage(0);
            setActiveKey(key);
          }}
        />
      </div>
    </main>
  );
}
