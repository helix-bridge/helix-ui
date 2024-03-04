import { HistoryRecord, Network, RecordResult } from "@/types";
import Table, { ColumnType } from "@/ui/table";
import {
  formatBalance,
  formatTime,
  getChainConfig,
  getChainLogoSrc,
  getTokenLogoSrc,
  parseRecordResult,
} from "@/utils";
import Image from "next/image";
import { Key, PropsWithChildren } from "react";
import PrettyAddress from "./pretty-address";
import { Address, isHash } from "viem";

interface Props {
  dataSource: DataSource[];
  loading?: boolean;
  onRowClick?: (key: Key, row: DataSource) => void;

  // pagination
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function RecordsTable({
  dataSource,
  loading,
  total,
  pageSize,
  currentPage,
  onPageChange,
  onRowClick,
}: Props) {
  const columns: ColumnType<DataSource>[] = [
    {
      key: "from",
      title: <Title>From</Title>,
      render: ({ fromChain }) => <FromTo network={fromChain} />,
      width: "16%",
    },
    {
      key: "to",
      title: <Title>To</Title>,
      render: ({ toChain }) => <FromTo network={toChain} />,
      width: "16%",
    },
    {
      key: "sender",
      title: <Title>Sender</Title>,
      render: ({ sender }) => <SenderReceiver address={sender} />,
      width: "16%",
    },
    {
      key: "receiver",
      title: <Title>Receiver</Title>,
      render: ({ recipient }) => <SenderReceiver address={recipient} />,
      width: "16%",
    },
    {
      key: "amount",
      title: <Title>Amount</Title>,
      render: ({ fromChain, sendAmount, sendToken }) => {
        const token = getChainConfig(fromChain)?.tokens.find((t) => t.symbol === sendToken);
        return token ? (
          <div className="flex items-center justify-start gap-medium">
            <Image width={32} height={32} alt="Token" src={getTokenLogoSrc(token.logo)} className="rounded-full" />
            <span className="truncate">
              {formatBalance(BigInt(sendAmount), token.decimals, { precision: 4 })} {token.symbol}
            </span>
          </div>
        ) : (
          <span>-</span>
        );
      },
      width: "18%",
    },
    {
      key: "status",
      title: <Title className="text-end">Status</Title>,
      render: ({ startTime, result, confirmedBlocks }) => (
        <div className="flex flex-col items-end truncate">
          <span>{formatTime(startTime * 1000, { compact: true })}</span>
          <span
            className={`text-xs font-semibold ${
              result === RecordResult.SUCCESS
                ? "text-app-green"
                : result === RecordResult.REFUNDED
                ? "text-app-orange"
                : result === RecordResult.PENDING
                ? "text-primary"
                : "text-white/50"
            }`}
          >
            {result === RecordResult.PENDING
              ? confirmedBlocks
                ? isHash(confirmedBlocks)
                  ? "Confirming"
                  : `Pending (${confirmedBlocks})`
                : "Pending"
              : parseRecordResult(result)}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Table
      className="min-w-[56rem]"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      total={total}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}

export interface DataSource extends HistoryRecord {
  key: Key;
}

function Title({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={`${className}`}>{children}</span>;
}

function FromTo({ network }: { network: Network }) {
  const chain = getChainConfig(network);

  return chain ? (
    <div className="flex items-center gap-medium">
      <Image width={32} height={32} alt="Logo" src={getChainLogoSrc(chain.logo)} className="rounded-full" />
      <span className="truncate">{chain.name}</span>
    </div>
  ) : (
    <span>-</span>
  );
}

function SenderReceiver({ address }: { address?: Address | null }) {
  return address ? <PrettyAddress address={address} copyable forceShort /> : <span>-</span>;
}
