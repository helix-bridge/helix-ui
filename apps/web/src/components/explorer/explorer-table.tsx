import { Network, RecordResult } from "../../types";
import Table, { ColumnType } from "./table";
import {
  formatBalance,
  formatTime,
  getChainConfig,
  getChainLogoSrc,
  getTokenLogoSrc,
  parseRecordResult,
} from "../../utils";
import PrettyAddress from "../pretty-address";
import { Address, isHash } from "viem";
import { useMediaQuery } from "../../hooks";
import { QueryExplorerTxsQuery } from "../../_generated_/gql/graphql";

type TData = NonNullable<NonNullable<NonNullable<QueryExplorerTxsQuery["historyRecords"]>["records"]>[number]>;

interface Props {
  onPageChange: (page: number) => void;
  onRowClick: (row: TData) => void;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  dataSource: TData[];
  loading: boolean;
}

function getColumns(isLg = false): ColumnType<TData>[] {
  return [
    {
      title: "From",
      key: "from",
      width: isLg ? undefined : "10%",
      render: (row) => {
        const chain = getChainConfig(row.fromChain as Network | undefined);
        return chain ? (
          <div className="gap-medium flex items-center">
            <img alt={chain.name} width={32} height={32} src={getChainLogoSrc(chain.logo)} className="rounded-full" />
            <span className="hidden truncate lg:inline">{chain.name}</span>
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      title: "To",
      key: "to",
      width: isLg ? undefined : "10%",
      render: (row) => {
        const chain = getChainConfig(row.toChain as Network | undefined);
        return chain ? (
          <div className="gap-medium flex items-center">
            <img alt={chain.name} width={32} height={32} src={getChainLogoSrc(chain.logo)} className="rounded-full" />
            <span className="hidden truncate lg:inline">{chain.name}</span>
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      title: "Sender",
      key: "sender",
      render: (row) =>
        row.sender ? <PrettyAddress address={row.sender as Address} copyable forceShort /> : <span>-</span>,
    },
    {
      title: "Recipient",
      key: "recipient",
      render: (row) =>
        row.recipient ? <PrettyAddress address={row.recipient as Address} copyable forceShort /> : <span>-</span>,
    },
    {
      title: "Amount",
      key: "amount",
      render: (row) => {
        const token = getChainConfig(row.fromChain as Network | undefined)?.tokens.find(
          ({ symbol }) => symbol.toUpperCase() === row.sendToken.toUpperCase(),
        );
        return token ? (
          <div className="gap-medium flex items-center">
            <img
              width={32}
              height={32}
              alt={token.symbol}
              src={getTokenLogoSrc(token.logo)}
              className="hidden rounded-full lg:block"
            />
            <span className="truncate">{`${formatBalance(BigInt(row.sendAmount), token.decimals)} ${
              token.symbol
            }`}</span>
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      title: <span className="text-end">Status</span>,
      key: "status",
      width: isLg ? "13%" : "15%",
      render: ({ result, startTime, confirmedBlocks }) => (
        <div className="flex flex-col items-end truncate">
          <span className="truncate">{formatTime(startTime * 1000, { compact: true })}</span>
          <span
            className={`truncate text-xs font-semibold ${
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
                  : `Pending ${confirmedBlocks}`
                : "Pending"
              : parseRecordResult(result)}
          </span>
        </div>
      ),
    },
  ];
}

export default function ExplorerTable({
  onPageChange,
  onRowClick,
  dataSource,
  currentPage,
  totalRecords,
  pageSize,
  loading,
}: Props) {
  const isLg = useMediaQuery("lg");

  return (
    <Table
      dataSource={dataSource.map(({ id, ...rest }) => ({ key: id, id, ...rest }))}
      totalRecords={totalRecords}
      currentPage={currentPage}
      pageSize={pageSize}
      columns={getColumns(isLg)}
      loading={loading}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}
