import { useRelayersData } from "@/hooks";
import { BridgeVersion, ChainConfig } from "@/types";
import { useCallback, useDeferredValue, useState } from "react";
import RelayersTable from "./relayers-table";
import Search from "@/ui/search";
import CountdownRefresh from "@/ui/countdown-refresh";
import ChainSelect from "../chain-select";
import { getLnBridgeAvailableTargetChains, getLnBridgeCrossDefaultValue } from "@/utils";

const pageSize = 10;
const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();

export default function Overview({ version }: { version: BridgeVersion }) {
  const [sourceChain, setSourceChain] = useState<ChainConfig>();
  const [targetChain, setTargetChain] = useState<ChainConfig>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const { loading, data, total, refetch } = useRelayersData(
    version,
    currentPage,
    pageSize,
    deferredSearchValue,
    sourceChain,
    targetChain,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(0);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchValue("");
    setCurrentPage(0);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-medium lg:flex-row lg:items-center">
        <Search
          value={searchValue}
          onClear={handleSearchClear}
          onChange={handleSearchChange}
          placeholder="Search by address"
          className="w-full lg:w-[21.5rem]"
        />

        <div className="flex items-center gap-small lg:gap-5">
          <div className="flex items-center gap-medium">
            <span className="hidden text-sm font-semibold text-white lg:inline">From</span>
            <ChainSelect
              className="h-9 w-40 rounded-medium border border-white/20 px-medium lg:w-44"
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
          <div className="flex items-center gap-medium">
            <span className="hidden text-sm font-semibold text-white lg:inline">To</span>
            <ChainSelect
              className="h-9 w-40 rounded-medium border border-white/20 px-medium lg:w-44"
              placeholder="Target chain"
              options={getLnBridgeAvailableTargetChains(sourceChain, defaultTargetChains)}
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
        onPageChange={setCurrentPage}
        onRefetch={refetch}
        currentPage={currentPage}
        totalRecords={total}
        pageSize={pageSize}
        dataSource={data}
        version={version}
        loading={loading}
      />
    </div>
  );
}
