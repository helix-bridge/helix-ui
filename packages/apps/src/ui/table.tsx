import { Fragment, Key, ReactElement, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import CountLoading from "./count-loading";
import Image from "next/image";
import Pagination from "./pagination";

export interface ColumnType<T> {
  title: ReactElement;
  key: Key;
  dataIndex?: keyof T;
  width?: string | number;
  render?: (row: T) => ReactElement;
}

interface Props<T> {
  dataSource: T[];
  columns: ColumnType<T>[];
  loading?: boolean;
  onRowClick?: (key: Key, row: T) => void;

  // pagination
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T extends { key: Key }>({
  total,
  columns,
  loading,
  dataSource,
  pageSize,
  currentPage,
  onRowClick,
  onPageChange,
}: Props<T>) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const templateCols = columns.reduce((acc, cur) => {
    const width = typeof cur.width === "string" ? cur.width : typeof cur.width === "number" ? `${cur.width}px` : "1fr";
    if (acc === "auto") {
      acc = width;
    } else {
      acc = `${acc} ${width}`;
    }
    return acc;
  }, "auto");

  return (
    <div className="min-w-[60rem] overflow-x-auto">
      {/* header */}
      <div
        className="gap-middle bg-component px-middle py-large grid items-center rounded-t text-sm font-normal text-white"
        style={{ gridTemplateColumns: templateCols }}
      >
        {columns.map(({ key, title }) => (
          <Fragment key={key}>{title}</Fragment>
        ))}
      </div>

      {/* body */}
      <div className="relative">
        {/* loading */}
        <CSSTransition
          in={loading}
          timeout={300}
          nodeRef={loadingRef}
          classNames="component-loading"
          unmountOnExit
          appear
        >
          <div
            className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center rounded-b"
            ref={loadingRef}
          >
            <CountLoading size="large" />
          </div>
        </CSSTransition>

        {/* content */}
        {dataSource.length ? (
          <div>
            {/* data source */}
            <div className="mb-5">
              {dataSource.map((row) => (
                <div
                  key={row.key}
                  className={`gap-middle p-middle grid items-center border-t border-t-white/10 text-sm font-light text-white transition-colors ${
                    onRowClick ? "hover:cursor-pointer hover:bg-white/10" : ""
                  }`}
                  style={{ gridTemplateColumns: templateCols }}
                  onClick={() => onRowClick && onRowClick(row.key, row)}
                >
                  {columns.map(({ key, dataIndex, render }) => (
                    <Fragment key={key}>
                      {render ? render(row) : dataIndex ? <span className="truncate">{row[dataIndex]}</span> : null}
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>

            {/* pagination */}
            {total !== undefined && currentPage !== undefined && (
              <Pagination total={total} pageSize={pageSize} currentPage={currentPage} onChange={onPageChange} />
            )}
          </div>
        ) : (
          <div className="gap-large flex h-48 flex-col items-center justify-center">
            {!loading && (
              <>
                <Image width={50} height={63} alt="No data" src="/images/no-data.svg" />
                <span className="text-sm font-light text-white/50">No data</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
