import { useRelayersData } from "../../hooks";
import { BridgeVersion } from "../../types";
import { useEffect, useState } from "react";
import CountdownRefresh from "../../ui/countdown-refresh";
import RelayersTable from "./relayers-table";
import { useAccount } from "wagmi";

const pageSize = 10;

export default function Manage({ version }: { version: BridgeVersion }) {
  const account = useAccount();
  const [currentPage, setCurrentPage] = useState(0);
  const { loading, data, total, refetch } = useRelayersData(version, currentPage, pageSize, account.address);

  useEffect(() => setCurrentPage(0), [version]);

  return (
    <div className="space-y-medium">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">Relayers</span>
        <CountdownRefresh onClick={refetch} />
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
        isDashboard
      />
    </div>
  );
}
