import { BridgeVersion, RelayersRecord } from "../../../types";
import { useCallback, useMemo, useState } from "react";
import Table, { ColumnType } from "../table";
import {
  getColumnAction,
  getColumnAllowance,
  getColumnBalance,
  getColumnBaseFee,
  getColumnFeeRate,
  getColumnFrom,
  getColumnLiquidity,
  getColumnMargin,
  getColumnPenalty,
  getColumnProfit,
  getColumnRelayer,
  getColumnStatus,
  getColumnTo,
  getColumnToken,
  getColumnTransferLimit,
} from "./columns";
import RelayerManageV3Modal from "../../../components/modals/relayer-manage-v3-modal";
import RelayerManageModal from "../../../components/modals/relayer-manage-modal";

type DataSource = RelayersRecord;

interface Props {
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  dataSource: DataSource[];
  version: BridgeVersion;
  isDashboard?: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
}

export default function RelayersTable({
  onPageChange,
  onRefetch,
  totalRecords,
  isDashboard,
  currentPage,
  dataSource,
  pageSize,
  version,
  loading,
}: Props) {
  const [relayerData, setRelayerData] = useState<DataSource>();

  const columns = useMemo<ColumnType<DataSource>[]>(() => {
    if (isDashboard) {
      if (version === "lnv3") {
        return [
          getColumnStatus({ version, isDashboard }),
          getColumnFrom({ version, isDashboard }),
          getColumnTo({ version, isDashboard }),
          getColumnToken({ version, isDashboard }),
          getColumnBaseFee({ version, isDashboard }),
          getColumnFeeRate({ version, isDashboard }),
          getColumnProfit({ version, isDashboard }),
          getColumnTransferLimit({ version, isDashboard }),
          getColumnPenalty({ version, isDashboard }),
          getColumnLiquidity({ version, isDashboard }),
          getColumnAllowance({ version, isDashboard }),
          getColumnBalance({ version, isDashboard }),
          getColumnAction({ onClick: setRelayerData }),
        ];
      } else {
        return [
          getColumnStatus({ version, isDashboard }),
          getColumnFrom({ version, isDashboard }),
          getColumnTo({ version, isDashboard }),
          getColumnToken({ version, isDashboard }),
          getColumnBaseFee({ version, isDashboard }),
          getColumnFeeRate({ version, isDashboard }),
          getColumnProfit({ version, isDashboard }),
          getColumnMargin({ version, isDashboard }),
          getColumnAllowance({ version, isDashboard }),
          getColumnBalance({ version, isDashboard }),
          getColumnAction({ onClick: setRelayerData }),
        ];
      }
    } else {
      if (version === "lnv3") {
        return [
          getColumnStatus({ version, isDashboard }),
          getColumnRelayer({ version, isDashboard }),
          getColumnFrom({ version, isDashboard }),
          getColumnTo({ version, isDashboard }),
          getColumnToken({ version, isDashboard }),
          getColumnBaseFee({ version, isDashboard }),
          getColumnFeeRate({ version, isDashboard }),
          getColumnProfit({ version, isDashboard }),
          getColumnTransferLimit({ version, isDashboard }),
          getColumnPenalty({ version, isDashboard }),
        ];
      } else {
        return [
          getColumnStatus({ version, isDashboard }),
          getColumnRelayer({ version, isDashboard }),
          getColumnFrom({ version, isDashboard }),
          getColumnTo({ version, isDashboard }),
          getColumnToken({ version, isDashboard }),
          getColumnBaseFee({ version, isDashboard }),
          getColumnFeeRate({ version, isDashboard }),
          getColumnProfit({ version, isDashboard }),
          getColumnMargin({ version, isDashboard }),
        ];
      }
    }
  }, [version, isDashboard]);

  const handleClose = useCallback(() => setRelayerData(undefined), []);

  return (
    <>
      <Table
        onPageChange={onPageChange}
        totalRecords={totalRecords}
        currentPage={currentPage}
        dataSource={dataSource}
        pageSize={pageSize}
        columns={columns}
        loading={loading}
        className={version === "lnv3" ? "min-w-[68rem]" : "min-w-[60rem]"}
      />

      {isDashboard &&
        (version === "lnv3" ? (
          <RelayerManageV3Modal
            relayerInfo={relayerData}
            isOpen={!!relayerData}
            onClose={handleClose}
            onSuccess={onRefetch}
          />
        ) : (
          <RelayerManageModal
            relayerInfo={relayerData}
            isOpen={!!relayerData}
            onClose={handleClose}
            onSuccess={onRefetch}
          />
        ))}
    </>
  );
}
