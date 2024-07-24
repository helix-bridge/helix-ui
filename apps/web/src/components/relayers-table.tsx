import { LnBridgeRelayerOverview, BridgeVersion, Network } from "../types";
import Button from "../ui/button";
import Table, { ColumnType } from "../ui/table";
import Tooltip from "../ui/tooltip";
import { formatBalance, formatFeeRate, getChainConfig, getChainLogoSrc, getTokenLogoSrc } from "../utils";
import { useState } from "react";
import PrettyAddress from "./pretty-address";
import RelayerManageModal from "./modals/relayer-manage-modal";
import RelayerManageV3Modal from "./modals/relayer-manage-v3-modal";
import RelayerAllowance from "./relayer-allowance";
import RelayerPenalty from "./relayer-penalty";
import RelayerBalance from "./relayer-balance";
import RelayerTotalLiquidity from "./relayer-total-liquidity";

interface Props {
  bridgeVersion: BridgeVersion;
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

function getColumns(bridgeVersion: BridgeVersion, isDashboard?: boolean) {
  const columns1: ColumnType<DataSource>[] = [
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
      width: isDashboard ? (bridgeVersion === "lnv3" ? "4%" : "6%") : "6%",
    },
    {
      key: "to",
      title: <Title title="To" />,
      render: ({ toChain }) => <FromTo network={toChain} />,
      width: isDashboard ? (bridgeVersion === "lnv3" ? "4%" : "6%") : "6%",
    },
    {
      key: "token",
      title: <Title title="Token" />,
      render: ({ fromChain, sendToken }) => {
        const token = getChainConfig(fromChain)?.tokens.find(
          (t) => t.address.toLowerCase() === sendToken?.toLowerCase(),
        );

        return token ? (
          <Tooltip content={token.symbol} className="w-fit">
            <img width={24} height={24} alt="Token" src={getTokenLogoSrc(token.logo)} className="rounded-full" />
          </Tooltip>
        ) : (
          <span>-</span>
        );
      },
      width: isDashboard ? (bridgeVersion === "lnv3" ? "5%" : "7%") : "6%",
    },
    {
      key: "base fee",
      title: <Title title="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction" />,
      render: ({ fromChain, sendToken, baseFee }) => {
        const token = getChainConfig(fromChain)?.tokens.find(
          (t) => t.address.toLowerCase() === sendToken?.toLowerCase(),
        );

        return token && baseFee ? (
          <span className="truncate">{formatBalance(BigInt(baseFee), token.decimals, { precision: 6 })}</span>
        ) : (
          <span>-</span>
        );
      },
      width: isDashboard ? (bridgeVersion === "lnv3" ? "6%" : "8%") : bridgeVersion === "lnv3" ? "9%" : "10%",
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
      width: isDashboard ? "7%" : bridgeVersion === "lnv3" ? "10%" : "11%",
    },
  ];

  const columns2: ColumnType<DataSource>[] = [
    {
      key: "profit",
      title: <Title title="Profit" />,
      render: ({ fromChain, sendToken, profit }) => {
        const token = getChainConfig(fromChain)?.tokens.find(
          (t) => t.address.toLowerCase() === sendToken?.toLowerCase(),
        );

        return token && profit ? (
          <span className="truncate">{formatBalance(BigInt(profit), token.decimals, { keepZero: false })}</span>
        ) : (
          <span>-</span>
        );
      },
      width: isDashboard ? "7%" : bridgeVersion === "lnv3" ? "9%" : "12%",
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
      width: isDashboard ? "6%" : bridgeVersion === "lnv3" ? "8%" : "11%",
    },
  ];

  const columns: ColumnType<DataSource>[] =
    bridgeVersion === "lnv3"
      ? [
          ...columns1,
          ...columns2,
          {
            key: "Transfer limit",
            title: <Title title="Transfer Limit" />,
            render: ({ transferLimit, fromChain, sendToken }) => {
              const token = getChainConfig(fromChain)?.tokens.find(
                (t) => t.address.toLowerCase() === sendToken?.toLowerCase(),
              );

              return transferLimit && token ? (
                <span className="truncate">
                  {formatBalance(BigInt(transferLimit), token.decimals, { keepZero: false })}
                </span>
              ) : (
                <span>-</span>
              );
            },
            width: isDashboard ? "7%" : "10%",
          },
          {
            key: "penalty",
            title: <Title title="Penalty" />,
            render: (row) => <RelayerPenalty record={row} />,
          },
        ]
      : [
          ...columns1,
          ...columns2,
          {
            key: "margin",
            title: <Title title="Margin" />,
            render: ({ margin, fromChain, sendToken }) => {
              const token = getChainConfig(fromChain)?.tokens.find(
                (t) => t.address.toLowerCase() === sendToken?.toLowerCase(),
              );

              return margin && token ? (
                <span className="truncate">{formatBalance(BigInt(margin), token.decimals, { keepZero: false })}</span>
              ) : (
                <span>-</span>
              );
            },
            width: "10%",
          },
        ];
  return columns;
}

export default function RelayersTable({
  bridgeVersion,
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
        ...getColumns(bridgeVersion, isDashboard),
        {
          key: "liquidity",
          title: <Title title="Liquidity" tips="Total withdrawable liquidity" />,
          render: (row) => <RelayerTotalLiquidity record={row} />,
          hidden: bridgeVersion === "lnv2",
          width: "7%",
        },
        {
          key: "allowance",
          title: <Title title="Allowance" tips="Allowance on target chain" />,
          render: (row) => <RelayerAllowance record={row} />,
          width: "7%",
        },
        {
          key: "balance",
          title: <Title title="Balance" tips="Balance on target chain" />,
          render: (row) => <RelayerBalance record={row} />,
        },
        {
          key: "status",
          title: <Title title="Status" />,
          render: ({ heartbeatTimestamp }) => {
            const isOnline = Date.now() - (heartbeatTimestamp ?? 0) * 1000 < 5 * 60 * 1000;
            return (
              <div className="gap-small flex items-center">
                <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            );
          },
          width: bridgeVersion === "lnv3" ? "5%" : "7%",
        },
        {
          key: "action",
          title: <Title title="Action" className="justify-end" />,
          render: (row) => (
            <div className="flex justify-end">
              <Button
                className="rounded-medium px-medium w-fit py-[2px]"
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
          width: "12%",
        },
        ...getColumns(bridgeVersion, isDashboard),
        {
          key: "status",
          title: <Title title="Status" className="justify-end" />,
          render: ({ heartbeatTimestamp }) => {
            const isOnline = Date.now() - (heartbeatTimestamp ?? 0) * 1000 < 5 * 60 * 1000;
            return (
              <div className="gap-small flex items-center justify-end">
                <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            );
          },
        },
      ];

  return (
    <>
      <Table
        className={
          isDashboard
            ? bridgeVersion === "lnv3"
              ? "min-w-[86rem]"
              : "min-w-[76rem]"
            : bridgeVersion === "lnv3"
              ? "min-w-[72rem]"
              : "min-w-[68rem]"
        }
        columns={columns}
        dataSource={records.map((item) => ({ ...item, key: item.id }))}
        loading={loading}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />

      {isDashboard &&
        (bridgeVersion === "lnv3" ? (
          <RelayerManageV3Modal
            relayerInfo={relayerInfo}
            isOpen={!!relayerInfo}
            onClose={() => setRelayerInfo(undefined)}
            onSuccess={onRefetch}
          />
        ) : (
          <RelayerManageModal
            relayerInfo={relayerInfo}
            isOpen={!!relayerInfo}
            onClose={() => setRelayerInfo(undefined)}
            onSuccess={onRefetch}
          />
        ))}
    </>
  );
}

function Title({ title, tips, className }: { title: string; tips?: string; className?: string }) {
  return (
    <div className={`gap-small flex items-center ${className}`}>
      <span className="truncate">{title}</span>
      {tips ? (
        <Tooltip content={tips} className="shrink-0" contentClassName="max-w-[18rem]">
          <img width={16} height={16} alt="Info" src="images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}

function FromTo({ network }: { network: Network }) {
  const config = getChainConfig(network);

  return config ? (
    <Tooltip content={config.name} className="w-fit">
      <img width={24} height={24} alt="Chain" src={getChainLogoSrc(config.logo)} className="my-1 rounded-full" />
    </Tooltip>
  ) : (
    "-"
  );
}
