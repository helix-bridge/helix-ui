import { useApp, useTxs } from "../../hooks";
import { useDeferredValue, useEffect, useState } from "react";
import ExplorerTable from "./explorer-table";
import { UrlSearchParamKey } from "../../types";
import Search from "../../ui/search";
import CountdownRefresh from "../../ui/countdown-refresh";
import { NetworkStatus } from "@apollo/client";
import { isAddress } from "viem";
import { useNavigate, useSearchParams } from "react-router-dom";

const pageSize = 10;

export default function Explorer() {
  const { recordsSearch, setRecordsSearch } = useApp();
  const deferredSearchValue = useDeferredValue(recordsSearch);

  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { data, total, networkStatus, refetch } = useTxs(deferredSearchValue.toLowerCase(), currentPage, pageSize);

  useEffect(() => {
    setRecordsSearch(new URLSearchParams(window.location.hash.split("?")[1]).get(UrlSearchParamKey.ADDRESS) || "");
  }, [setRecordsSearch]);

  useEffect(() => {
    const page = Number(new URLSearchParams(window.location.hash.split("?")[1]).get(UrlSearchParamKey.PAGE));
    if (!Number.isNaN(page) && page > 0) {
      setCurrentPage(page - 1);
    }
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-5">
        <Search
          placeholder="Search by address"
          className="hover:border-primary w-full lg:w-[26.5rem]"
          value={recordsSearch}
          onChange={(value) => {
            setRecordsSearch(value);
            setCurrentPage(0);

            setSearchParams((params) => {
              params.delete(UrlSearchParamKey.PAGE);
              if (isAddress(value)) {
                params.set(UrlSearchParamKey.ADDRESS, value);
              } else {
                params.delete(UrlSearchParamKey.ADDRESS);
              }
              return params;
            });
          }}
          onClear={() => {
            setRecordsSearch("");
            setCurrentPage(0);
            setSearchParams((params) => {
              params.delete(UrlSearchParamKey.ADDRESS);
              params.delete(UrlSearchParamKey.PAGE);
              return params;
            });
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
          setSearchParams((params) => {
            params.set(UrlSearchParamKey.PAGE, (page + 1).toString());
            return params;
          });
        }}
        onRowClick={({ id }) => navigate(`/tx/${id}`, { state: { source: "explorer" } })}
      />
    </div>
  );
}
