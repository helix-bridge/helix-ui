import { useEffect, useState } from "react";
import RelayersTable from "./relayers-table";
import { LnRelayerInfo, LnRelayersResponseData, LnRelayersVariables } from "@/types/graphql";
import { useQuery } from "@apollo/client";
import { QUERY_LNRELAYERS } from "@/config/gql";

const pageSize = 12;

export default function RelayersManage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState<LnRelayerInfo[]>([]);

  const { loading, data } = useQuery<LnRelayersResponseData, LnRelayersVariables>(QUERY_LNRELAYERS, {
    variables: { row: pageSize, page: currentPage },
  });

  useEffect(() => {
    if (!loading) {
      setRecords(data?.queryLnv20RelayInfos?.records || []);
    }
  }, [loading, data]);

  return (
    <RelayersTable
      loading={loading}
      records={records}
      total={data?.queryLnv20RelayInfos?.total || 0}
      isDashboard={true}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}
