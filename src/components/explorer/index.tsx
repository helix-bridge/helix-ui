"use client";

import { useApp, useTxs } from "@/hooks";
import { useDeferredValue, useEffect, useState } from "react";
import ExplorerTable from "./explorer-table";
import { UrlSearchParamKey } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import Search from "@/ui/search";
import CountdownRefresh from "@/ui/countdown-refresh";
import { NetworkStatus } from "@apollo/client";
import { isAddress } from "viem";

const pageSize = 10;

export default function Explorer() {
  const { recordsSearch, setRecordsSearch } = useApp();
  const deferredSearchValue = useDeferredValue(recordsSearch);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(0);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { data, total, networkStatus, refetch } = useTxs(deferredSearchValue.toLowerCase(), currentPage, pageSize);

  useEffect(() => {
    setRecordsSearch(new URLSearchParams(window.location.search).get(UrlSearchParamKey.ADDRESS) || "");
  }, [setRecordsSearch]);

  useEffect(() => {
    const page = Number(new URLSearchParams(window.location.search).get(UrlSearchParamKey.PAGE));
    if (!Number.isNaN(page) && page > 0) {
      setCurrentPage(page - 1);
    }
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-5">
        <Search
          placeholder="Search by address"
          className="w-full hover:border-primary lg:w-[26.5rem]"
          value={recordsSearch}
          onChange={(value) => {
            setRecordsSearch(value);
            setCurrentPage(0);

            const params = new URLSearchParams(searchParams.toString());
            params.delete(UrlSearchParamKey.PAGE);
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
          enabledAfterClick
        />
      </div>
      <ExplorerTable
        dataSource={data}
        totalRecords={total}
        currentPage={currentPage}
        pageSize={pageSize}
        loading={
          networkStatus === NetworkStatus.loading ||
          networkStatus === NetworkStatus.setVariables ||
          (networkStatus === NetworkStatus.refetch && isManualRefresh)
        }
        onPageChange={(page) => {
          setCurrentPage(page);
          const params = new URLSearchParams(searchParams.toString());
          params.set(UrlSearchParamKey.PAGE, (page + 1).toString());
          router.push(`?${params.toString()}`);
        }}
        onRowClick={({ id }) => router.push(`record?${UrlSearchParamKey.ID}=${id}`)}
      />
    </div>
  );
}
