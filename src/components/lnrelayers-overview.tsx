"use client";

import { GQL_QUERY_LNBRIDGE_RELAY_INFOS } from "@/config";
import {
  ChainConfig,
  LnBridgeRelayerOverview,
  LnBridgeVersion,
  QueryLnBridgeRelayInfosReqParams,
  QueryLnBridgeRelayInfosResData,
} from "@/types";
import Search from "@/ui/search";
import { getLnBridgeAvailableTargetChains, getLnBridgeCrossDefaultValue } from "@/utils";
import { useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import CountdownRefresh from "@/ui/countdown-refresh";
import RelayersTable from "./relayers-table";

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();
const pageSize = 12;

interface Props {
  bridgeVersion: LnBridgeVersion;
}

export default function LnRelayersOverview({ bridgeVersion }: Props) {
  const [records, setRecords] = useState<LnBridgeRelayerOverview[]>([]);
  const [sourceChain, setSourceChain] = useState<ChainConfig>();
  const [targetChain, setTargetChain] = useState<ChainConfig>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const { loading, data, refetch } = useQuery<QueryLnBridgeRelayInfosResData, QueryLnBridgeRelayInfosReqParams>(
    GQL_QUERY_LNBRIDGE_RELAY_INFOS,
    {
      variables: {
        fromChain: sourceChain?.network,
        toChain: targetChain?.network,
        row: pageSize,
        page: currentPage,
        relayer: deferredSearchValue.toLowerCase() || undefined,
        version: bridgeVersion,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    if (!loading) {
      setRecords(data?.queryLnBridgeRelayInfos?.records || []);
    }
  }, [loading, data]);

  return (
    <div>
      <div className="mb-5 flex flex-col items-start justify-between gap-middle lg:flex-row lg:items-center">
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

        <div className="flex items-center gap-small lg:gap-5">
          <div className="flex items-center gap-middle">
            <span className="hidden font-medium text-white lg:inline">From</span>
            <ChainSelect
              className="w-40 border border-white/20 px-middle py-[7px]"
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
          <div className="flex items-center gap-middle">
            <span className="hidden font-medium text-white lg:inline">To</span>
            <ChainSelect
              className="w-40 border border-white/20 px-middle py-[7px]"
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
        bridgeVersion={bridgeVersion}
        records={records}
        total={data?.queryLnBridgeRelayInfos?.total || 0}
        pageSize={pageSize}
        currentPage={currentPage}
        onRefetch={refetch}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
