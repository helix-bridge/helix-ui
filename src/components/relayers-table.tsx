import { LnBridgeRelayerOverview, Network } from "@/types";
import Button from "@/ui/button";
import Table, { ColumnType } from "@/ui/table";
import Tooltip from "@/ui/tooltip";
import { formatBalance, formatFeeRate, getChainConfig, getChainLogoSrc, getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import PrettyAddress from "./pretty-address";
import RelayerManageModal from "./modals/relayer-manage-modal";

interface Props {
  total: number;
  records: LnBridgeRelayerOverview[];
  loading: boolean;
  isDashboard?: boolean;
  pageSize: number;
  currentPage: number;
  onRefetch: () => void;
  onPageChange: (value: number) => void;
}

interface DataSource extends LnBridgeRelayerOverview {
  key: string;
}

const commonColumns: ColumnType<DataSource>[] = [
  // {
  //   key: "bridge type",
  //   title: <Title title="Bridge Type" />,
  //   render: ({ bridge }) => (
  //     <span className="text-sm font-normal text-white">
  //       {bridge === "lnv2-opposite" ? "Opposite" : "Default"}
  //     </span>
  //   ),
  //   width: "8%",
  // },
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
        <Tooltip content={token.symbol} className="w-fit">
          <Image width={24} height={24} alt="Token" src={getTokenLogoSrc(token.logo)} className="rounded-full" />
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
        <span className="truncate">{formatBalance(BigInt(baseFee), token.decimals, { keepZero: false })}</span>
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
        tips="Liquidity Fee Rate: The percentage deducted by the relayer from the transfer amount in a transaction"
      />
    ),
    render: ({ liquidityFeeRate }) =>
      typeof liquidityFeeRate === "number" ? (
        <span className="truncate">{`${formatFeeRate(liquidityFeeRate)}%`}</span>
      ) : (
        <span>-</span>
      ),
    width: "10%",
  },
  {
    key: "margin",
    title: <Title title="Margin" />,
    render: ({ margin, fromChain, sendToken }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return margin && token ? (
        <span className="truncate">{formatBalance(BigInt(margin), token.decimals, { keepZero: false })}</span>
      ) : (
        <span>-</span>
      );
    },
    width: "12%",
  },
  {
    key: "cost",
    title: <Title title="Cost" />,
    render: ({ cost }) => {
      // the unit is ETH, so the precision is 18
      return cost ? (
        <span className="truncate">{formatBalance(BigInt(cost), 18, { keepZero: false, precision: 5 })}</span>
      ) : (
        <span>-</span>
      );
    },
    width: "10%",
  },
  {
    key: "profit",
    title: <Title title="Profit" />,
    render: ({ fromChain, sendToken, profit }) => {
      const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());

      return token && profit ? (
        <span className="truncate">{formatBalance(BigInt(profit), token.decimals, { keepZero: false })}</span>
      ) : (
        <span>-</span>
      );
    },
  },
];

export default function RelayersTable({
  total,
  records,
  loading,
  isDashboard,
  pageSize,
  currentPage,
  onRefetch,
  onPageChange,
}: Props) {
  const [relayerInfo, setRelayerInfo] = useState<LnBridgeRelayerOverview>();

  const columns: ColumnType<DataSource>[] = isDashboard
    ? [
        ...commonColumns,
        {
          key: "status",
          title: <Title title="Status" />,
          render: ({ heartbeatTimestamp }) => {
            const isOnline = Date.now() - (heartbeatTimestamp ?? 0) * 1000 < 5 * 60 * 1000;
            return (
              <div className="flex items-center gap-small">
                <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            );
          },
        },
        {
          key: "action",
          title: <Title title="Action" className="justify-end" />,
          render: (row) => (
            <div className="flex justify-end">
              <Button
                className="w-fit rounded-middle px-middle py-[2px]"
                onClick={() => setRelayerInfo(row)}
                kind="default"
              >
                <span>Manage</span>
              </Button>
            </div>
          ),
        },
      ]
    : [
        {
          key: "relayer",
          title: <Title title="Relayer" />,
          render: ({ relayer }) => (
            <div className="truncate">
              <PrettyAddress address={relayer} forceShort copyable />
            </div>
          ),
        },
        ...commonColumns,
        {
          key: "status",
          title: <Title title="Status" className="justify-end" />,
          render: ({ heartbeatTimestamp }) => {
            const isOnline = Date.now() - (heartbeatTimestamp ?? 0) * 1000 < 5 * 60 * 1000;
            return (
              <div className="flex items-center justify-end gap-small">
                <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            );
          },
        },
      ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={records.map((item) => ({ ...item, key: item.id }))}
        loading={loading}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />

      {isDashboard && (
        <RelayerManageModal
          relayerInfo={relayerInfo}
          isOpen={!!relayerInfo}
          onClose={() => setRelayerInfo(undefined)}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
}

function Title({ title, tips, className }: { title: string; tips?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-small ${className}`}>
      <span className="truncate">{title}</span>
      {tips ? (
        <Tooltip content={tips} className="shrink-0" contentClassName="max-w-[18rem]">
          <Image width={16} height={16} alt="Info" src="/images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}

function FromTo({ network }: { network: Network }) {
  const config = getChainConfig(network);

  return config ? (
    <Tooltip content={config.name} className="w-fit">
      <Image width={24} height={24} alt="Chain" src={getChainLogoSrc(config.logo)} className="my-1 rounded-full" />
    </Tooltip>
  ) : (
    "-"
  );
}
