import { HistoryResData, RecordResult } from "../../types";
import Table, { ColumnType } from "./table";
import { formatBalance, formatTime, getChainConfig, getChainLogoSrc } from "../../utils";

type TData = HistoryResData["historyRecords"]["records"][0];

const columns: ColumnType<TData>[] = [
  {
    title: "",
    key: "status",
    width: "10%",
    render: (row) => (
      <div className="pl-[20%]">{row.result === RecordResult.SUCCESS ? <SuccessIcon /> : <PendingIcon />}</div>
    ),
  },
  {
    title: "Time",
    key: "time",
    width: "35%",
    render: (row) => <span>{formatTime(row.startTime * 1000, { compact: true })}</span>,
  },
  {
    title: "Value",
    key: "value",
    render: (row) => {
      const token = getChainConfig(row.fromChain)?.tokens.find(
        ({ symbol }) => symbol.toUpperCase() === row.sendToken.toUpperCase(),
      );
      return (
        <span className="truncate">
          {token ? `${formatBalance(BigInt(row.sendAmount), token.decimals)} ${token.symbol}` : "-"}
        </span>
      );
    },
  },
  {
    title: <span className="text-center">From</span>,
    key: "from",
    width: "15%",
    render: (row) => {
      const chain = getChainConfig(row.fromChain);
      return (
        <div className="flex justify-center">
          {chain ? (
            <img alt={chain.name} width={20} height={20} src={getChainLogoSrc(chain.logo)} className="rounded-full" />
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
  },
  {
    title: <span className="text-center">To</span>,
    key: "to",
    width: "15%",
    render: (row) => {
      const chain = getChainConfig(row.toChain);
      return (
        <div className="flex justify-center">
          {chain ? (
            <img alt={chain.name} width={20} height={20} src={getChainLogoSrc(chain.logo)} className="rounded-full" />
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
  },
];

interface Props {
  onPageChange: (page: number) => void;
  onRowClick: (row: TData) => void;
  totalRecords: number;
  currentPage: number;
  dataSource: TData[];
  loading: boolean;
}

export default function HistoryTable({
  onPageChange,
  onRowClick,
  dataSource,
  currentPage,
  totalRecords,
  loading,
}: Props) {
  return (
    <Table
      dataSource={dataSource}
      totalRecords={totalRecords}
      currentPage={currentPage}
      pageSize={10}
      columns={columns}
      loading={loading}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path
        d="M364.032 896a46.144 46.144 0 0 1-35.712-15.424L15.36 559.936c-20.48-20.608-18.752-53.184 0-73.792 20.352-20.544 52.672-18.816 73.088 0l275.584 284.672 573.248-584.704a51.072 51.072 0 0 1 73.088 0 52.032 52.032 0 0 1 0 73.728l-610.624 620.736a48.768 48.768 0 0 1-35.712 15.424z"
        fill="#1afa29"
      ></path>
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M554.656 170.656h-85.344v362.656l273.056 183.456 51.2-68.256-238.944-157.856z" fill="#00B2FF" />
      <path
        d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m0 938.656c-234.656 0-426.656-192-426.656-426.656S277.344 85.344 512 85.344s426.656 192 426.656 426.656-192 426.656-426.656 426.656z"
        fill="#00B2FF"
      />
    </svg>
  );
}
