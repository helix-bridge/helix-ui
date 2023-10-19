"use client";

import { QUERY_LNRELAYERS } from "@/config/gql";
import { ChainConfig } from "@/types/chain";
import { LnRelayerInfo, LnRelayersResponseData, LnRelayersVariables } from "@/types/graphql";
import Search from "@/ui/search";
import { useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import RelayersTable from "./relayers-table";
import CountdownRefresh from "@/ui/countdown-refresh";
import { getParsedCrossChain } from "@/utils/cross-chain";

const { defaultSourceChains, defaultTargetChains, availableTargetChains } = getParsedCrossChain();
const pageSize = 12;

export default function LnRelayerOverview() {
  const [records, setRecords] = useState<LnRelayerInfo[]>([]);
  const [sourceChain, setSourceChain] = useState<ChainConfig>();
  const [targetChain, setTargetChain] = useState<ChainConfig>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const { loading, data, refetch } = useQuery<LnRelayersResponseData, LnRelayersVariables>(QUERY_LNRELAYERS, {
    variables: {
      fromChain: sourceChain?.network,
      toChain: targetChain?.network,
      row: pageSize,
      page: currentPage,
      relayer: deferredSearchValue.toLowerCase() || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

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
            <span className="hidden text-sm font-normal text-white lg:inline">From</span>
            <ChainSelect
              className="px-middle border-line w-40 py-[7px]"
              placeholder="Source chain"
              options={defaultSourceChains}
              onChange={(value) => {
                setSourceChain(value);
                setTargetChain(undefined);
                setCurrentPage(0);
              }}
              value={sourceChain}
            />
          </div>
          <div className="gap-middle flex items-center">
            <span className="hidden text-sm font-normal text-white lg:inline">To</span>
            <ChainSelect
              className="px-middle border-line w-40 py-[7px]"
              placeholder="Target chain"
              options={
                sourceChain ? availableTargetChains[sourceChain.network] || defaultTargetChains : defaultTargetChains
              }
              onChange={(value) => {
                setTargetChain(value);
                setCurrentPage(0);
              }}
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
