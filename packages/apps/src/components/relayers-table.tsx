import { LnRelayerInfo } from "@/types/graphql";
import Table, { ColumnType } from "@/ui/table";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import PrettyAddress from "./pretty-address";
import { Network } from "@/types/chain";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import { formatBalance } from "@/utils/balance";

interface Props {
  total: number;
  records: LnRelayerInfo[];
  loading: boolean;
  pageSize: number;
  currentPage: number;
  onPageChange: (value: number) => void;
}

interface DataSource extends LnRelayerInfo {
  key: string;
}

const columns: ColumnType<DataSource>[] = [
  {
    key: "relayer",
    title: <Title title="Relayer" />,
    render: ({ relayer }) => <PrettyAddress className="text-sm font-normal text-white" address={relayer} forceShort />,
  },
  {
    key: "bridge type",
    title: <Title title="Bridge Type" />,
    render: ({ bridge }) => (
      <span className="text-sm font-normal text-white">
        {bridge === "lnbridgev20-opposite" ? "Opposite" : "Default"}
      </span>
    ),
    width: "8%",
  },
  {
    key: "from",
    title: <Title title="From" />,
    render: ({ fromChain }) => <FromTo network={fromChain} />,
    width: "6%",
  },
  {
    key: "to",
    title: <Title title="To" />,
    render: ({ toChain }) => <FromTo network={toChain} />,
    width: "6%",
  },
  {
    key: "token",
    title: <Title title="Token" />,
    render: ({ fromChain, sendToken }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return token ? (
        <Tooltip content={<span className="text-xs font-normal text-white">{token.symbol}</span>} className="w-fit">
          <Image width={24} height={24} alt="Token" src={getTokenLogoSrc(token.logo)} />
        </Tooltip>
      ) : (
        <span>-</span>
      );
    },
    width: "6%",
  },
  {
    key: "base fee",
    title: <Title title="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction" />,
    render: ({ fromChain, sendToken, baseFee }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return token && baseFee ? (
        <span className="text-sm font-normal text-white">
          {formatBalance(BigInt(baseFee), token.decimals, { keepZero: false })}
        </span>
      ) : (
        <span>-</span>
      );
    },
  },
  {
    key: "liquidity fee rate",
    title: (
      <Title
        title="Liquidity Fee Rate"
        tips="The percentage deducted by the relayer from the transfer amount in a transaction"
      />
    ),
    render: ({ liquidityFeeRate }) =>
      liquidityFeeRate ? (
        <span className="text-sm font-normal text-white">{`${liquidityFeeRate}%`}</span>
      ) : (
        <span>-</span>
      ),
    width: "14%",
  },
  {
    key: "margin",
    title: <Title title="Margin" />,
    render: ({ margin, fromChain, sendToken }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return margin && token ? (
        <span className="text-sm font-normal text-white">
          {formatBalance(BigInt(margin), token.decimals, { keepZero: false })}
        </span>
      ) : (
        <span>-</span>
      );
    },
  },
  {
    key: "cost",
    title: <Title title="Cost" />,
    render: ({ fromChain, sendToken, cost }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return token && cost ? (
        <span className="truncate text-sm font-normal text-white">
          {formatBalance(BigInt(cost), token.decimals, { keepZero: false })}
        </span>
      ) : (
        <span>-</span>
      );
    },
    width: "12%",
  },
  {
    key: "profit",
    title: <Title title="Profit" />,
    render: ({ fromChain, sendToken, profit }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return token && profit ? (
        <span className="text-sm font-normal text-white">
          {formatBalance(BigInt(profit), token.decimals, { keepZero: false })}
        </span>
      ) : (
        <span>-</span>
      );
    },
  },
  {
    key: "status",
    title: <Title title="Status" className="justify-end" />,
    render: ({ heartbeatTimestamp }) => {
      const isOnline = !heartbeatTimestamp || Date.now() - heartbeatTimestamp * 1000 < 5 * 60 * 1000;
      return (
        <div className="gap-small flex items-center justify-end">
          <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
          <span className="text-sm font-normal text-white">{isOnline ? "Online" : "Offline"}</span>
        </div>
      );
    },
  },
];

export default function RelayersTable({ total, records, loading, pageSize, currentPage, onPageChange }: Props) {
  return (
    <Table
      columns={columns}
      dataSource={records.map((item) => ({ ...item, key: item.id }))}
      loading={loading}
      total={total}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={onPageChange}
    />
  );
}

function Title({ title, tips, className }: { title: string; tips?: string; className?: string }) {
  return (
    <div className={`gap-small flex items-center ${className}`}>
      <span className="truncate text-sm font-normal text-white">{title}</span>
      {!!tips && (
        <Tooltip
          content={<span className="text-xs font-normal text-white">{tips}</span>}
          className="shrink-0"
          contentClassName="max-w-[18rem]"
        >
          <Image width={16} height={16} alt="Info" src="/images/info.svg" />
        </Tooltip>
      )}
    </div>
  );
}

function FromTo({ network }: { network: Network }) {
  const config = getChainConfig(network);

  return config ? (
    <Tooltip content={<span className="text-xs font-normal text-white">{config.name}</span>} className="w-fit">
      <Image width={24} height={24} alt="Chain" src={getChainLogoSrc(config.logo)} className="my-1 rounded-full" />
    </Tooltip>
  ) : (
    "-"
  );
}