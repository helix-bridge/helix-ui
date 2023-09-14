import { Record, RecordStatus } from "@/types";
import PrettyAddress from "@/components/pretty-address";
import Table, { ColumnType } from "@/ui/table";
import {
  formatBlanace,
  formatRecordStatus,
  formatTime,
  getChainConfig as getAppChainConfig,
  getBridgeConfig,
} from "@/utils";
import { Network, TokenSymbol, getChainConfig as getHelixjsChainConfig } from "helix.js";
import Image from "next/image";
import { Key, PropsWithChildren } from "react";

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

export interface DataSource extends Record {
  key: Key;
}

const columns: ColumnType<DataSource>[] = [
  {
    key: "from",
    title: <Title>From</Title>,
    render: ({ fromChain, sendAmount, sendToken }) => (
      <FromTo chain={fromChain} amount={BigInt(sendAmount)} symbol={sendToken} />
    ),
  },
  {
    key: "to",
    title: <Title>To</Title>,
    render: ({ toChain, recvAmount, recvToken }) => (
      <FromTo chain={toChain} amount={BigInt(recvAmount)} symbol={recvToken} />
    ),
  },
  {
    key: "sender",
    title: <Title>Sender</Title>,
    render: ({ sendTokenAddress }) => <SenderReceiver address={sendTokenAddress} />,
  },
  {
    key: "receiver",
    title: <Title>Receiver</Title>,
    render: ({ recvTokenAddress }) => <SenderReceiver address={recvTokenAddress} />,
  },
  {
    key: "bridge",
    title: <Title>Bridge</Title>,
    render: ({ bridge }) => (
      <Image
        width={36}
        height={36}
        alt="Bridge"
        src={`/images/bridge/${getBridgeConfig(bridge)?.logo || "unknown.png"}`}
        className="rounded-full"
      />
    ),
  },
  {
    key: "status",
    title: <Title className="text-end">Status</Title>,
    render: ({ startTime, result, confirmedBlocks }) => (
      <div className="gap-small flex flex-col items-end">
        <span className="text-xs font-normal text-white">{formatTime(startTime * 1000, { compact: true })}</span>
        <span
          className={`text-xs font-semibold ${
            result === RecordStatus.Success
              ? "text-app-green"
              : result === RecordStatus.Refunded
              ? "text-app-orange"
              : result === RecordStatus.Pending
              ? "text-primary"
              : "text-white/50"
          }`}
        >
          {formatRecordStatus(result)}
          {result === RecordStatus.Pending && confirmedBlocks ? ` (${confirmedBlocks})` : ""}
        </span>
      </div>
    ),
  },
];

function Title({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={`text-sm font-normal text-white ${className}`}>{children}</span>;
}

function FromTo({ chain, amount, symbol }: { chain: Network; amount: bigint; symbol: TokenSymbol }) {
  const appChainConfig = getAppChainConfig(chain);
  const helixjsChainConfig = getHelixjsChainConfig(chain);
  const token = helixjsChainConfig?.tokens.find((t) => t.symbol === symbol);

  return token && appChainConfig ? (
    <div className="gap-middle flex items-start">
      <Image
        width={36}
        height={36}
        alt="Logo"
        src={`/images/network/${appChainConfig.logo}`}
        className="rounded-full"
      />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium text-white">
          {formatBlanace(amount, token.decimals, { keepZero: false })} {symbol}
        </span>
        <span className="text-xs font-normal text-white/50">{appChainConfig.name}</span>
      </div>
    </div>
  ) : (
    <span className="text-sm font-medium text-white">-</span>
  );
}

function SenderReceiver({ address }: { address?: string | null }) {
  return address ? (
    <PrettyAddress address={address} className="text-sm font-normal text-white" copyable forceShort />
  ) : (
    <span className="text-sm font-normal text-white">-</span>
  );
}
