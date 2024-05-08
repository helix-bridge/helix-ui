"use client";

import { useHistory } from "@/hooks";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import HistoryDetail from "./history-detail";
import HistoryTable from "./history-table";
import { useAccount } from "wagmi";

const Modal = dynamic(() => import("./modal"), { ssr: false });

export default function History({ children, className }: PropsWithChildren<{ className: string }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { loading, data, total, refetch } = useHistory(currentPage, isOpen);
  const [detail, setDetail] = useState<(typeof data)[0] | null>();

  useEffect(() => {
    if (isOpen) {
      refetch();
    } else {
      setCurrentPage(0);
      setDetail(null);
    }
  }, [isOpen, refetch]);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = detail ? detailRef : historyRef;

  const account = useAccount();

  return account.address ? (
    <>
      <button
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children ?? <span>History</span>}
      </button>

      <Modal isOpen={isOpen} isDetail={!!detail} onClose={() => setIsOpen(false)} onBack={() => setDetail(null)}>
        <SwitchTransition>
          <CSSTransition
            key={detail ? "detail" : "history"}
            classNames={detail ? "history-detail-fade" : "history-table-fade"}
            timeout={100}
            nodeRef={nodeRef}
            unmountOnExit
          >
            <div ref={nodeRef}>
              {detail ? (
                <HistoryDetail data={detail} />
              ) : (
                <HistoryTable
                  onPageChange={setCurrentPage}
                  onRowClick={setDetail}
                  currentPage={currentPage}
                  totalRecords={total}
                  dataSource={data}
                  loading={loading}
                />
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </Modal>
    </>
  ) : null;
}
