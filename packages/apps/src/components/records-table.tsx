import { HistoryRecord, Network, RecordResult, TokenSymbol } from "@/types";
import Table, { ColumnType } from "@/ui/table";
import { bridgeFactory, formatBalance, formatTime, getChainConfig, getChainLogoSrc, parseRecordResult } from "@/utils";
import Image from "next/image";
import { Key, PropsWithChildren } from "react";
import PrettyAddress from "./pretty-address";
import BridgeIdenticon from "./bridge-identicon";
import { Address } from "viem";

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
      render: ({ fromChain, sendAmount, sendToken }) => (
        <FromTo network={fromChain} amount={BigInt(sendAmount)} symbol={sendToken} />
      ),
      width: "18%",
    },
    {
      key: "to",
      title: <Title>To</Title>,
      render: ({ toChain, recvAmount, recvToken }) => (
        <FromTo network={toChain} amount={BigInt(recvAmount || 0)} symbol={recvToken} />
      ),
      width: "18%",
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
      key: "bridge",
      title: <Title className="text-center">Bridge</Title>,
      render: (row) => {
        const bridge = bridgeFactory({ category: row.bridge });
        return (
          <div className="flex justify-center">
            <BridgeIdenticon width={36} height={36} type="symbol" bridge={bridge} />
          </div>
        );
      },
      width: "10%",
    },
    {
      key: "status",
      title: <Title className="text-end">Status</Title>,
      render: ({ startTime, result, confirmedBlocks }) => (
        <div className="flex flex-col items-end">
          <span className="text-sm">{formatTime(startTime * 1000, { compact: true })}</span>
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
            {parseRecordResult(result)}
            {result === RecordResult.PENDING && confirmedBlocks ? ` (${confirmedBlocks})` : ""}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Table
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

function FromTo({ network, amount, symbol }: { network: Network; amount: bigint; symbol: TokenSymbol }) {
  const chain = getChainConfig(network);
  const token = chain?.tokens.find((t) => t.symbol === symbol);

  return token && chain ? (
    <div className="gap-middle flex items-start">
      <Image width={32} height={32} alt="Logo" src={getChainLogoSrc(chain.logo)} className="rounded-full" />
      <div className="flex flex-col items-start">
        <span className="truncate text-sm">
          {formatBalance(amount, token.decimals, { precision: 4 })} {symbol}
        </span>
        <span className="text-xs font-medium text-white/50">{chain.name}</span>
      </div>
    </div>
  ) : (
    <span className="text-sm">-</span>
  );
}

function SenderReceiver({ address }: { address?: Address | null }) {
  return address ? (
    <PrettyAddress address={address} className="text-sm" copyable forceShort />
  ) : (
    <span className="text-sm">-</span>
  );
}
