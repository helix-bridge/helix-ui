"use client";

import { GQL_QUERY_LNV20_RELAY_INFOS } from "@/config";
import { ChainConfig, Lnv20RelayerOverview, QueryLnV20RelayInfosReqParams, QueryLnV20RelayInfosResData } from "@/types";
import Search from "@/ui/search";
import { getLnBridgeAvailableTargetChains, getLnBridgeCrossDefaultValue } from "@/utils";
import { useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import CountdownRefresh from "@/ui/countdown-refresh";
import RelayersTable from "./relayers-table";

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();
const pageSize = 12;

export default function LnRelayerOverview() {
  const [records, setRecords] = useState<Lnv20RelayerOverview[]>([]);
  const [sourceChain, setSourceChain] = useState<ChainConfig>();
  const [targetChain, setTargetChain] = useState<ChainConfig>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const { loading, data, refetch } = useQuery<QueryLnV20RelayInfosResData, QueryLnV20RelayInfosReqParams>(
    GQL_QUERY_LNV20_RELAY_INFOS,
    {
      variables: {
        fromChain: sourceChain?.network,
        toChain: targetChain?.network,
        row: pageSize,
        page: currentPage,
        relayer: deferredSearchValue.toLowerCase() || undefined,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    if (!loading) {
      setRecords(data?.queryLnv20RelayInfos?.records || []);
    }
  }, [loading, data]);

  return (
    <>
      <div className="gap-middle mb-5 flex flex-col items-start justify-between lg:flex-row lg:items-center">
        <Search
          className="w-full lg:w-[21.5rem]"
          placeholder="Search by address"
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
            setCurrentPage(0);
          }}
          onClear={() => setSearchValue("")}
        />

        <div className="gap-small flex items-center lg:gap-5">
          <div className="gap-middle flex items-center">
            <span className="hidden font-normal text-white lg:inline">From</span>
            <ChainSelect
              className="px-middle border-line w-40 py-[7px]"
              placeholder="Source chain"
              options={defaultSourceChains}
              onChange={(value) => {
                setSourceChain(value);
                setTargetChain(undefined);
                setCurrentPage(0);
              }}
              compact
              value={sourceChain}
            />
          </div>
          <div className="gap-middle flex items-center">
            <span className="hidden font-normal text-white lg:inline">To</span>
            <ChainSelect
              className="px-middle border-line w-40 py-[7px]"
              placeholder="Target chain"
              options={getLnBridgeAvailableTargetChains(sourceChain, defaultTargetChains)}
              onChange={(value) => {
                setTargetChain(value);
                setCurrentPage(0);
              }}
              compact
              value={targetChain}
            />
          </div>

          <CountdownRefresh onClick={refetch} />
        </div>
      </div>

      <RelayersTable
        loading={loading}
        records={records}
        total={data?.queryLnv20RelayInfos?.total || 0}
        pageSize={pageSize}
        currentPage={currentPage}
        onRefetch={refetch}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
