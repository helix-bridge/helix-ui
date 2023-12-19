"use client";

import { GQL_HISTORY_RECORDS } from "@/config";
import { useApp } from "@/hooks";
import { HistoryRecordsReqParams, HistoryRecordsResData, RecordResult, UrlSearchParamKey } from "@/types";
import Tabs, { TabsProps } from "@/ui/tabs";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import RecordsTable from "./records-table";
import Search from "@/ui/search";
import { isAddress } from "viem";
import CountdownRefresh from "@/ui/countdown-refresh";

enum AllResult {
  All = -1,
}
type TabKey = RecordResult | AllResult;

const pageSize = 10;

export default function HistoryRecords() {
  const { recordsSearch, setRecordsSearch } = useApp();
  const deferredSearchValue = useDeferredValue(recordsSearch);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<TabsProps<TabKey>["activeKey"]>(AllResult.All);
  const [records, setRecords] = useState<HistoryRecordsResData>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const { loading, data, networkStatus, refetch } = useQuery<HistoryRecordsResData, HistoryRecordsReqParams>(
    GQL_HISTORY_RECORDS,
    {
      variables: {
        row: pageSize,
        page: currentPage,
        sender: deferredSearchValue.toLowerCase(),
        recipient: deferredSearchValue.toLowerCase(),
        results:
          activeKey === AllResult.All
            ? undefined
            : activeKey === RecordResult.PENDING
            ? [RecordResult.PENDING, RecordResult.PENDING_TO_REFUND, RecordResult.PENDING_TO_CLAIM]
            : [activeKey],
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    // Better user experience
    if (!loading) {
      setRecords(data);
    }
  }, [loading, data]);

  useEffect(() => {
    setRecordsSearch(new URLSearchParams(window.location.search).get(UrlSearchParamKey.ADDRESS) || "");
  }, [setRecordsSearch]);

  useEffect(() => {
    const page = Number(new URLSearchParams(window.location.search).get(UrlSearchParamKey.PAGE));
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
        params.set(UrlSearchParamKey.PAGE, (page + 1).toString());
        router.push(`?${params.toString()}`);
      }}
      onRowClick={(_, { id }) => router.push(`record?${UrlSearchParamKey.ID}=${id}`)}
    />
  );

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Search
          placeholder="Search by address"
          className="w-full hover:border-primary lg:w-[26.5rem]"
          value={recordsSearch}
          onChange={(value) => {
            setRecordsSearch(value);
            setCurrentPage(0);
            setActiveKey(AllResult.All);

            const params = new URLSearchParams(searchParams.toString());
            if (isAddress(value)) {
              params.set(UrlSearchParamKey.ADDRESS, value);
              router.push(`?${params.toString()}`);
            } else if (params.has(UrlSearchParamKey.ADDRESS)) {
              params.delete(UrlSearchParamKey.ADDRESS);
              router.push(`?${params.toString()}`);
            }
          }}
          onClear={() => {
            setRecordsSearch("");

            const params = new URLSearchParams(searchParams.toString());
            if (params.has(UrlSearchParamKey.ADDRESS)) {
              params.delete(UrlSearchParamKey.ADDRESS);
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
          enabled={networkStatus === NetworkStatus.ready}
          enabledAfterClick={true}
        />
      </div>

      <Tabs
        className="mt-5"
        options={[
          {
            key: AllResult.All,
            label: "All",
            children: createChildren(),
          },
          {
            key: RecordResult.PENDING,
            label: "Pending",
            children: createChildren(),
          },
          {
            key: RecordResult.SUCCESS,
            label: "Success",
            children: createChildren(),
          },
          {
            key: RecordResult.REFUNDED,
            label: "Refunded",
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
