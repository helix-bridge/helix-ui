import { Record, RecordStatus } from "@/types/graphql";
import PrettyAddress from "@/components/pretty-address";
import Table, { ColumnType } from "@/ui/table";
import Image from "next/image";
import { Key, PropsWithChildren } from "react";
import { formatBalance } from "@/utils/balance";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { formatRecordStatus, getChainLogoSrc } from "@/utils/misc";
import { formatTime } from "@/utils/time";
import BridgeLogo from "./bridge-logo";
import { bridgeFactory } from "@/utils/bridge";

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
        <FromTo chain={fromChain} amount={BigInt(sendAmount)} symbol={sendToken} />
      ),
      width: "18%",
    },
    {
      key: "to",
      title: <Title>To</Title>,
      render: ({ toChain, recvAmount, recvToken }) => (
        <FromTo chain={toChain} amount={BigInt(recvAmount)} symbol={recvToken} />
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
            <BridgeLogo width={36} height={36} type="symbol" bridge={bridge} className="bg-component" />
          </div>
        );
      },
      width: "10%",
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

function Title({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={`text-sm font-normal text-white ${className}`}>{children}</span>;
}

function FromTo({ chain, amount, symbol }: { chain: Network; amount: bigint; symbol: TokenSymbol }) {
  const chainConfig = getChainConfig(chain);
  const token = chainConfig?.tokens.find((t) => t.symbol === symbol);

  return token && chainConfig ? (
    <div className="gap-middle flex items-start">
      <Image width={32} height={32} alt="Logo" src={getChainLogoSrc(chainConfig.logo)} className="rounded-full" />
      <div className="flex flex-col items-start">
        <span className="truncate text-sm font-medium text-white">
          {formatBalance(amount, token.decimals, { keepZero: false })} {symbol}
        </span>
        <span className="text-xs font-normal text-white/50">{chainConfig.name}</span>
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
