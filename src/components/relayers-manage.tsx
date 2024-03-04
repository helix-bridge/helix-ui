import { GQL_QUERY_LNBRIDGE_RELAY_INFOS } from "@/config";
import {
  LnBridgeRelayerOverview,
  LnBridgeVersion,
  QueryLnBridgeRelayInfosReqParams,
  QueryLnBridgeRelayInfosResData,
} from "@/types";
import CountdownRefresh from "@/ui/countdown-refresh";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import RelayersTable from "./relayers-table";

const pageSize = 10;

interface Props {
  bridgeVersion: LnBridgeVersion;
}

export default function RelayersManage({ bridgeVersion }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState<LnBridgeRelayerOverview[]>([]);

  const { address } = useAccount();
  const { loading, data, refetch } = useQuery<QueryLnBridgeRelayInfosResData, QueryLnBridgeRelayInfosReqParams>(
    GQL_QUERY_LNBRIDGE_RELAY_INFOS,
    {
      variables: { relayer: (address || "").toLowerCase(), version: bridgeVersion, row: pageSize, page: currentPage },
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
      <div className="mb-middle flex items-center justify-between">
        <span className="text-base font-semibold text-white">Relayers</span>
        <CountdownRefresh onClick={refetch} />
      </div>
      <RelayersTable
        loading={loading}
        bridgeVersion={bridgeVersion}
        records={records}
        total={data?.queryLnBridgeRelayInfos?.total || 0}
        isDashboard={true}
        pageSize={pageSize}
        currentPage={currentPage}
        onRefetch={refetch}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
