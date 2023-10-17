"use client";

import { QUERY_RECORDS } from "@/config/gql";
import { RecordStatus, RecordsResponseData, RecordsVariables } from "@/types/graphql";
import Tabs, { TabsProps } from "@/ui/tabs";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import RecordsTable from "@/components/records-table";
import { UrlSearchParam } from "@/types/url";
import Search from "@/ui/search";
import { isAddress } from "viem";
import CountdownRefresh from "@/ui/countdown-refresh";
import { useApp } from "@/hooks/use-app";

enum AllStatus {
  All = -1,
}
type TabKey = RecordStatus | AllStatus;

const pageSize = 10;

export default function HistoryRecords() {
  const { recordsSearch, setRecordsSearch } = useApp();
  const deferredSearchValue = useDeferredValue(recordsSearch);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<TabsProps<TabKey>["activeKey"]>(AllStatus.All);
  const [records, setRecords] = useState<RecordsResponseData>();
  const [currentPage, setCurrentPage] = useState(0);

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
          : activeKey === RecordStatus.PENDING
          ? [RecordStatus.PENDING, RecordStatus.PENDING_TO_REFUND, RecordStatus.PENDING_TO_CLAIM]
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

  useEffect(() => {
    setRecordsSearch(new URLSearchParams(window.location.search).get(UrlSearchParam.ADDRESS) || "");
  }, [setRecordsSearch]);

  useEffect(() => {
    const page = Number(new URLSearchParams(window.location.search).get(UrlSearchParam.PAGE));
    if (!Number.isNaN(page) && page > 0) {
      setCurrentPage(page - 1);
    }
  }, []);

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
      onPageChange={(page) => {
        setCurrentPage(page);
        const params = new URLSearchParams(searchParams.toString());
        params.set(UrlSearchParam.PAGE, (page + 1).toString());
        router.push(`?${params.toString()}`);
      }}
      onRowClick={(_, { id }) => router.push(`${pathName}/${id}`)}
    />
  );

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Search
          placeholder="Search by address"
          className="w-full lg:w-[26.5rem]"
          value={recordsSearch}
          onChange={(value) => {
            setRecordsSearch(value);
            setCurrentPage(0);
            setActiveKey(AllStatus.All);

            const params = new URLSearchParams(searchParams.toString());
            if (isAddress(value)) {
              params.set(UrlSearchParam.ADDRESS, value);
              router.push(`?${params.toString()}`);
            } else if (params.has(UrlSearchParam.ADDRESS)) {
              params.delete(UrlSearchParam.ADDRESS);
              router.push(`?${params.toString()}`);
            }
          }}
          onClear={() => {
            setRecordsSearch("");

            const params = new URLSearchParams(searchParams.toString());
            if (params.has(UrlSearchParam.ADDRESS)) {
              params.delete(UrlSearchParam.ADDRESS);
              router.push(`?${params.toString()}`);
            }
          }}
        />

        <CountdownRefresh
          onClick={() => {
            setIsManualRefresh(true);
            setTimeout(() => refetch(), 0);
          }}
          onRefresh={() => {
            setIsManualRefresh(false);
            setTimeout(() => refetch(), 0);
          }}
          isActive={networkStatus === NetworkStatus.ready}
          isStartUpAfterClick={true}
        />
      </div>

      <Tabs
        className="mt-5"
        options={[
          {
            key: AllStatus.All,
            label: <span>All</span>,
            children: createChildren(),
          },
          {
            key: RecordStatus.PENDING,
            label: <span>Pending</span>,
            children: createChildren(),
          },
          {
            key: RecordStatus.SUCCESS,
            label: <span>Success</span>,
            children: createChildren(),
          },
          {
            key: RecordStatus.REFUNDED,
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
    </>
  );
}
