"use client";

import { QUERY_LNRELAYERS } from "@/config/gql";
import { Network } from "@/types/chain";
import { LnRelayerInfo, LnRelayersResponseData, LnRelayersVariables } from "@/types/graphql";
import SearchInput from "@/ui/search-input";
import { useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import RelayersTable from "./relayers-table";
import CountdownRefresh from "@/ui/countdown-refresh";
import { getCrossChain, getParsedCrossChain } from "@/utils/cross-chain";

const { sourceChainTokens, availableTargetChains } = getParsedCrossChain();
const pageSize = 12;

export default function LnRelayerOverview() {
  const [records, setRecords] = useState<LnRelayerInfo[]>([]);
  const [sourceChain, setSourceChain] = useState<Network>();
  const [targetChain, setTargetChain] = useState<Network>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const { loading, data, refetch } = useQuery<LnRelayersResponseData, LnRelayersVariables>(QUERY_LNRELAYERS, {
    variables: {
      fromChain: sourceChain,
      toChain: targetChain,
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
        <SearchInput
          className="w-full lg:w-[21.5rem]"
          placeholder="Search by address"
          value={searchValue}
          onChange={setSearchValue}
          onReset={() => setSearchValue("")}
        />

        <div className="flex items-center gap-5">
          <div className="gap-middle flex items-center">
            <span className="text-sm font-normal text-white">From</span>
            <ChainSelect
              className="px-middle border-line hover:border-primary w-40 py-2"
              placeholder="Source chain"
              options={sourceChainTokens.map(({ network }) => network)}
              onChange={(value) => {
                setSourceChain(value);
                setTargetChain(undefined);
              }}
              value={sourceChain}
            />
          </div>
          <div className="gap-middle flex items-center">
            <span className="text-sm font-normal text-white">To</span>
            <ChainSelect
              className="px-middle border-line hover:border-primary w-40 py-2"
              placeholder="Target chain"
              options={
                sourceChain ? (Object.keys(getCrossChain()[sourceChain] || {}) as Network[]) : availableTargetChains
              }
              onChange={setTargetChain}
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
        onPageChange={setCurrentPage}
      />
    </>
  );
}
