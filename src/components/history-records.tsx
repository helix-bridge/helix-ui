"use client";

import { GQL_HISTORY_RECORDS } from "@/config";
import { useApp } from "@/hooks";
import { HistoryRecordsReqParams, HistoryRecordsResData, UrlSearchParamKey } from "@/types";
import { NetworkStatus, useQuery } from "@apollo/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import RecordsTable from "./records-table";
import Search from "@/ui/search";
import { isAddress } from "viem";
import CountdownRefresh from "@/ui/countdown-refresh";

const pageSize = 10;

export default function HistoryRecords() {
  const { recordsSearch, setRecordsSearch } = useApp();
  const deferredSearchValue = useDeferredValue(recordsSearch);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();

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
        bridges: [
          "helix-sub2ethv2(lock)",
          "helix-sub2ethv2(unlock)",
          "helix-sub2subv21(lock)",
          "helix-sub2subv21(unlock)",
          "l2arbitrumbridge-ethereum",
          "lpbridge-darwinia-dvm",
          "lpbridge-ethereum",
          "xtoken-crab-dvm",
          "xtoken-darwinia-dvm",
          "xtoken-pangolin-dvm",
          "xtoken-sepolia",
        ],
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

  return (
    <div className="container mx-auto">
      <div className="mb-5 flex items-center justify-between gap-5">
        <Search
          placeholder="Search by address"
          className="w-full hover:border-primary lg:w-[26.5rem]"
          value={recordsSearch}
          onChange={(value) => {
            setRecordsSearch(value);
            setCurrentPage(0);

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
        onRowClick={(_, { id }) => router.push(`${pathName}/${id}`)}
      />
    </div>
  );
}
