import { BridgeVersion, Network, RelayersRecord } from "@/types";
import { ColumnType } from "../table";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import { formatBalance, formatFeeRate, getChainConfig, getChainLogoSrc, getTokenLogoSrc } from "@/utils";
import RelayerPenalty from "@/components/relayer-penalty";
import RelayerTotalLiquidity from "@/components/relayer-total-liquidity";
import RelayerAllowance from "@/components/relayer-allowance";
import RelayerBalance from "@/components/relayer-balance";
import Button from "@/ui/button";
import PrettyAddress from "@/components/pretty-address";

type DataSource = RelayersRecord;
type Args = { isDashboard?: boolean; version?: BridgeVersion; onClick?: (row: DataSource) => void };

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

function Chain({ network }: { network: Network }) {
  const config = getChainConfig(network);
  return config ? (
    <Tooltip content={config.name} className="mx-auto w-fit">
      <Image width={24} height={24} alt={config.name} src={getChainLogoSrc(config.logo)} className="rounded-full" />
    </Tooltip>
  ) : (
    <span>-</span>
  );
}

export const getColumnStatus = ({ version, isDashboard }: Args): ColumnType<DataSource> => ({
  key: "status",
  title: "",
  width: isDashboard ? (version === "lnv3" ? 32 : 54) : 54,
  render: ({ heartbeatTimestamp }) => {
    const isOnline = Date.now() - (heartbeatTimestamp ?? 0) * 1000 < 5 * 60 * 1000; // 5 Minutes
    return (
      <Tooltip content={isOnline ? "Online" : "Offline"} className="mx-auto w-fit">
        <div className={`h-[6px] w-[6px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
      </Tooltip>
    );
  },
});

export const getColumnFrom = ({ isDashboard }: Args): ColumnType<DataSource> => ({
  key: "from",
  title: <Title title="From" className="justify-center" />,
  render: ({ fromChain }) => <Chain network={fromChain} />,
  width: isDashboard ? 54 : undefined,
});

export const getColumnTo = ({ isDashboard }: Args): ColumnType<DataSource> => ({
  key: "to",
  title: <Title title="To" className="justify-center" />,
  render: ({ toChain }) => <Chain network={toChain} />,
  width: isDashboard ? 54 : undefined,
});

export const getColumnToken = ({ isDashboard }: Args): ColumnType<DataSource> => ({
  key: "token",
  title: <Title title="Token" className="justify-center" />,
  render: ({ fromChain, sendToken }) => {
    const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());
    return token ? (
      <Tooltip content={token.symbol} className="mx-auto w-fit">
        <Image width={24} height={24} alt={token.symbol} src={getTokenLogoSrc(token.logo)} className="rounded-full" />
      </Tooltip>
    ) : (
      <span>-</span>
    );
  },
  width: isDashboard ? 72 : undefined,
});

export const getColumnBaseFee = (_: Args): ColumnType<DataSource> => ({
  key: "base fee",
  title: <Title title="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction" />,
  render: ({ fromChain, sendToken, baseFee }) => {
    const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());
    return token && baseFee ? (
      <span className="truncate">{formatBalance(BigInt(baseFee), token.decimals, { precision: 6 })}</span>
    ) : (
      <span>-</span>
    );
  },
});

export const getColumnFeeRate = (_: Args): ColumnType<DataSource> => ({
  key: "liquidity fee rate",
  title: (
    <Title
      title="Liquidity Fee Rate"
      tips="Liquidity Fee Rate: the percentage deducted by the relayer from the transfer amount in a transaction"
    />
  ),
  render: ({ liquidityFeeRate }) =>
    typeof liquidityFeeRate === "number" ? (
      <span className="truncate">{`${formatFeeRate(liquidityFeeRate)}%`}</span>
    ) : (
      <span>-</span>
    ),
  width: 118,
});

export const getColumnProfit = (_: Args): ColumnType<DataSource> => ({
  key: "profit",
  title: <Title title="Profit" />,
  render: ({ fromChain, sendToken, profit }) => {
    const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());
    return token && profit ? (
      <span className="truncate">{formatBalance(BigInt(profit), token.decimals)}</span>
    ) : (
      <span>-</span>
    );
  },
});

export const getColumnCost = (_: Args): ColumnType<DataSource> => ({
  key: "cost",
  title: <Title title="Cost" />,
  render: ({ cost }) => {
    // Native token, so the precision is 18
    return cost ? (
      <span className="truncate">{formatBalance(BigInt(cost), 18, { precision: 6 })}</span>
    ) : (
      <span>-</span>
    );
  },
});

export const getColumnMargin = (_: Args): ColumnType<DataSource> => ({
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
});

export const getColumnTransferLimit = (_: Args): ColumnType<DataSource> => ({
  key: "Transfer limit",
  title: <Title title="Transfer Limit" />,
  render: ({ transferLimit, fromChain, sendToken }) => {
    const token = getChainConfig(fromChain)?.tokens.find((t) => t.address.toLowerCase() === sendToken?.toLowerCase());
    return transferLimit && token ? (
      <span className="truncate">{formatBalance(BigInt(transferLimit), token.decimals, { keepZero: false })}</span>
    ) : (
      <span>-</span>
    );
  },
});

export const getColumnPenalty = (_: Args): ColumnType<DataSource> => ({
  key: "penalty",
  title: <Title title="Penalty" />,
  render: (row) => <RelayerPenalty record={row} />,
});

export const getColumnLiquidity = (_: Args): ColumnType<DataSource> => ({
  key: "liquidity",
  title: <Title title="Liquidity" tips="Total withdrawable liquidity" />,
  render: (row) => <RelayerTotalLiquidity record={row} />,
});

export const getColumnAllowance = (_: Args): ColumnType<DataSource> => ({
  key: "allowance",
  title: <Title title="Allowance" tips="Allowance on target chain" />,
  render: (row) => <RelayerAllowance record={row} />,
});

export const getColumnBalance = (_: Args): ColumnType<DataSource> => ({
  key: "balance",
  title: <Title title="Balance" tips="Balance on target chain" />,
  render: (row) => <RelayerBalance record={row} />,
});

export const getColumnAction = ({ onClick = () => undefined }: Args): ColumnType<DataSource> => ({
  key: "action",
  title: <Title title="Action" className="justify-center" />,
  render: (row) => (
    <div className="flex justify-center">
      <Button className="w-fit rounded-medium px-medium py-[2px]" onClick={() => onClick(row)} kind="default">
        <span>Manage</span>
      </Button>
    </div>
  ),
});

export const getColumnRelayer = (_: Args): ColumnType<DataSource> => ({
  key: "relayer",
  title: <Title title="Relayer" />,
  render: ({ relayer }) => (
    <div className="truncate">
      <PrettyAddress address={relayer} forceShort copyable />
    </div>
  ),
});
