import ComponentLoading from "../../ui/component-loading";
import Pagination from "./pagination";
import { Fragment, Key, useMemo } from "react";

export type ColumnType<T> = {
  title: JSX.Element | string;
  width?: string | number;
  key: Key;
} & ({ dataIndex: keyof T; render?: never } | { dataIndex?: never; render: (row: T) => JSX.Element | string | number });

interface Props<T> {
  columns: ColumnType<Omit<T, "key">>[];
  loading?: boolean;
  dataSource?: T[];
  onRowClick?: (row: T) => void;

  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T extends { key: Key }>({
  onPageChange,
  onRowClick,
  totalRecords,
  currentPage,
  pageSize,
  dataSource,
  loading,
  columns,
}: Props<T>) {
  const templateCols = useMemo(
    () =>
      columns.reduce((acc, cur) => {
        const width =
          typeof cur.width === "string" ? cur.width : typeof cur.width === "number" ? `${cur.width}px` : "1fr";
        if (acc === "auto") {
          acc = width;
        } else {
          acc = `${acc} ${width}`;
        }
        return acc;
      }, "auto"),
    [columns],
  );

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="bg-secondary min-w-[62rem] rounded-2xl p-2 lg:p-5">
          {/* Header */}
          <div
            className="bg-background py-large grid items-center gap-x-2 rounded-t-xl border-b border-b-white/10 px-3 text-sm font-normal text-white/50"
            style={{ gridTemplateColumns: templateCols }}
          >
            {columns.map(({ key, title }) =>
              typeof title === "string" ? <h5 key={key}>{title}</h5> : <Fragment key={key}>{title}</Fragment>,
            )}
          </div>

          {/* Body */}
          <div className="relative">
            <ComponentLoading
              loading={loading}
              className={`rounded-b-xl ${dataSource?.length ? "bg-black/5 backdrop-blur-[2px]" : ""}`}
              color="white"
            />

            {dataSource?.length ? (
              <div className="rounded-b-xl">
                {dataSource.map((row) => (
                  <div
                    className={`${
                      onRowClick ? "hover:bg-background/50 transition-colors hover:cursor-pointer" : ""
                    } bg-background grid items-center gap-x-2 px-3 py-2 text-sm font-normal text-white last:rounded-b-xl`}
                    style={{ gridTemplateColumns: templateCols }}
                    onClick={() => onRowClick && onRowClick(row)}
                    key={row.key}
                  >
                    {columns.map(({ key, dataIndex, render }) => (
                      <Fragment key={key}>{render ? render(row) : <span>{`${row[dataIndex]}`}</span>}</Fragment>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-4">
                {loading ? null : (
                  <>
                    <img width={50} height={63} alt="No data" src="images/no-data.svg" />
                    <span className="text-sm font-normal text-slate-400">No data</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalRecords !== undefined && currentPage !== undefined && (
        <div className="overflow-x-auto pb-1">
          <Pagination size={pageSize} current={currentPage} total={totalRecords} onChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
