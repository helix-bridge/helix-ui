import { Fragment, Key, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import Pagination from "./pagination";
import ComponentLoading from "../ui/component-loading";

export interface ColumnType<T> {
  title: ReactElement;
  key: Key;
  dataIndex?: keyof T;
  hidden?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right"; // TODO
  render?: (row: T) => ReactElement;
}

interface Props<T> {
  dataSource: T[];
  columns: ColumnType<T>[];
  loading?: boolean;
  className?: string;
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
  className,
  dataSource,
  pageSize,
  currentPage,
  onRowClick,
  onPageChange,
}: Props<T>) {
  const [isOverflow, setIsOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const templateCols = useMemo(
    () =>
      columns
        .filter(({ hidden }) => !hidden)
        .reduce((acc, cur) => {
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

  useEffect(() => {
    setTimeout(() => {
      if (ref.current && ref.current.clientWidth < ref.current.scrollWidth) {
        setIsOverflow(true);
      }
    }, 0);
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        {isOverflow && (
          <div
            className="rounded-r-medium pointer-events-none absolute right-0 top-0 z-[1] h-full w-6 lg:w-8"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, .3))" }}
          />
        )}

        <div
          className={`rounded-medium overflow-x-auto ${isOverflow ? "cursor-grab" : ""}`}
          ref={ref}
          style={{ scrollbarWidth: "none" }}
        >
          <div className={`${className}`}>
            {/* header */}
            <div
              className="gap-medium rounded-t-medium bg-component px-medium py-large lg:px-large grid items-center text-sm font-extrabold text-white"
              style={{ gridTemplateColumns: templateCols }}
            >
              {columns
                .filter(({ hidden }) => !hidden)
                .map(({ key, title }) => (
                  <Fragment key={key}>{title}</Fragment>
                ))}
            </div>

            {/* body */}
            <div className="relative">
              {/* loading */}
              <ComponentLoading loading={!!loading} className="rounded-b-medium bg-black/30" color="white" />

              {/* content */}
              {dataSource.length ? (
                <div className="rounded-b-medium bg-inner">
                  {dataSource.map((row) => (
                    <div
                      key={row.key}
                      className={`gap-medium p-medium lg:px-large grid items-center border-t border-t-white/10 text-sm font-medium transition-colors ${
                        onRowClick ? "hover:cursor-pointer hover:bg-white/5" : ""
                      }`}
                      style={{ gridTemplateColumns: templateCols }}
                      onClick={() => onRowClick && onRowClick(row.key, row)}
                    >
                      {columns
                        .filter(({ hidden }) => !hidden)
                        .map(({ key, dataIndex, render }) => (
                          <Fragment key={key}>
                            {render ? (
                              render(row)
                            ) : dataIndex ? (
                              <span className="truncate">{`${row[dataIndex]}`}</span>
                            ) : null}
                          </Fragment>
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gap-large flex h-48 flex-col items-center justify-center">
                  {!loading && (
                    <>
                      <img width={50} height={63} alt="No data" src="images/no-data.svg" />
                      <span className="text-sm font-medium text-white/50">No data</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* pagination */}
      {total !== undefined && currentPage !== undefined && (
        <div className="overflow-x-auto">
          <Pagination
            className="mt-medium"
            total={total}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
