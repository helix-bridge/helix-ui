import ComponentLoading from "../../ui/component-loading";
import Pagination from "../../ui/pagination";
import { Fragment, Key, useMemo } from "react";

export type ColumnType<T> = {
  title: JSX.Element | string;
  width?: string | number;
  key: Key;
} & ({ dataIndex: keyof T; render?: never } | { dataIndex?: never; render: (row: T) => JSX.Element | string | number });

interface Props<T> {
  columns: ColumnType<T>[];
  loading?: boolean;
  dataSource?: T[];
  onRowClick?: (row: T) => void;

  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T extends { id: Key }>({
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
      <div className="w-full overflow-x-auto pb-1">
        <div className="w-[39.5rem]">
          {/* Header */}
          <div
            className="grid items-center gap-x-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white"
            style={{ gridTemplateColumns: templateCols }}
          >
            {columns.map(({ key, title }) =>
              typeof title === "string" ? <h5 key={key}>{title}</h5> : <Fragment key={key}>{title}</Fragment>,
            )}
          </div>

          {/* Body */}
          <div className="relative mt-1">
            <ComponentLoading
              loading={loading}
              className={`rounded-xl ${dataSource?.length ? "bg-black/10 backdrop-blur-[2px]" : ""}`}
              color="white"
            />

            {dataSource?.length ? (
              <div className="space-y-1 rounded-b-xl">
                {dataSource.map((row) => (
                  <div
                    className={`${
                      onRowClick ? "transition-colors hover:cursor-pointer hover:bg-white/5" : ""
                    } grid items-center gap-x-2 rounded-xl px-3 py-2 text-sm font-normal text-white`}
                    style={{ gridTemplateColumns: templateCols }}
                    onClick={() => onRowClick && onRowClick(row)}
                    key={row.id}
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
                    <span className="text-sm font-medium text-slate-400">No data</span>
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
          <Pagination total={totalRecords} pageSize={pageSize} currentPage={currentPage} onChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
