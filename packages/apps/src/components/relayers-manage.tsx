import { GQL_QUERY_LNV20_RELAY_INFOS } from "@/config";
import { Lnv20RelayerOverview, QueryLnV20RelayInfosReqParams, QueryLnV20RelayInfosResData } from "@/types";
import CountdownRefresh from "@/ui/countdown-refresh";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import RelayersTable from "./relayers-table";

const pageSize = 10;

export default function RelayersManage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState<Lnv20RelayerOverview[]>([]);

  const { address } = useAccount();
  const { loading, data, refetch } = useQuery<QueryLnV20RelayInfosResData, QueryLnV20RelayInfosReqParams>(
    GQL_QUERY_LNV20_RELAY_INFOS,
    {
      variables: { relayer: (address || "").toLowerCase(), row: pageSize, page: currentPage },
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
      <div className="mb-middle flex items-center justify-between">
        <span className="text-base font-semibold text-white">Dashboard</span>
        <CountdownRefresh onClick={refetch} />
      </div>
      <RelayersTable
        loading={loading}
        records={records}
        total={data?.queryLnv20RelayInfos?.total || 0}
        isDashboard={true}
        pageSize={pageSize}
        currentPage={currentPage}
        onRefetch={refetch}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
