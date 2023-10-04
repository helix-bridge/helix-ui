import { useEffect, useState } from "react";
import RelayersTable from "./relayers-table";
import { LnRelayerInfo, LnRelayersResponseData, LnRelayersVariables } from "@/types/graphql";
import { useQuery } from "@apollo/client";
import { QUERY_LNRELAYERS } from "@/config/gql";
import CountdownRefresh from "@/ui/countdown-refresh";
import { useAccount } from "wagmi";

const pageSize = 10;

export default function RelayersManage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState<LnRelayerInfo[]>([]);

  const { address } = useAccount();
  const { loading, data, refetch } = useQuery<LnRelayersResponseData, LnRelayersVariables>(QUERY_LNRELAYERS, {
    variables: { relayer: (address || "").toLowerCase(), row: pageSize, page: currentPage },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!loading) {
      setRecords(data?.queryLnv20RelayInfos?.records || []);
    }
  }, [loading, data]);

  return (
    <>
      <div className="mb-middle flex items-center justify-between">
        <span className="font-semibold">Dashboard</span>
        <CountdownRefresh onClick={refetch} />
      </div>
      <RelayersTable
        loading={loading}
        records={records}
        total={data?.queryLnv20RelayInfos?.total || 0}
        isDashboard={true}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
