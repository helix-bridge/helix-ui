import { useApp, useHistory } from "../../hooks";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import HistoryDetails from "./history-details";
import HistoryTable from "./history-table";
import { useAccount } from "wagmi";
import Modal from "./modal";

export default function History({ children, className }: PropsWithChildren<{ className: string }>) {
  const { isHistoryOpen, historyDetailsTxHash, setIsHistoryOpen, setHistoryDetailsTxHash } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const { loading, data, total, refetch } = useHistory(currentPage, isHistoryOpen);

  useEffect(() => {
    if (isHistoryOpen) {
      refetch();
    } else {
      setCurrentPage(0);
      setHistoryDetailsTxHash(null);
    }
  }, [isHistoryOpen, refetch, setHistoryDetailsTxHash]);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = historyDetailsTxHash ? detailRef : historyRef;

  const account = useAccount();

  const handleRowClick = useCallback(
    (r: (typeof data)[0]) => setHistoryDetailsTxHash(r.requestTxHash),
    [setHistoryDetailsTxHash],
  );

  return account.address ? (
    <>
      <button
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsHistoryOpen(true);
        }}
      >
        {children ?? <span>History</span>}
      </button>

      <Modal
        isOpen={isHistoryOpen}
        isDetail={!!historyDetailsTxHash}
        onClose={() => setIsHistoryOpen(false)}
        onBack={() => setHistoryDetailsTxHash(null)}
      >
        <SwitchTransition>
          <CSSTransition
            key={historyDetailsTxHash ? "detail" : "history"}
            classNames={historyDetailsTxHash ? "history-detail-fade" : "history-table-fade"}
            timeout={100}
            nodeRef={nodeRef}
            unmountOnExit
          >
            <div ref={nodeRef}>
              {historyDetailsTxHash ? (
                <HistoryDetails requestTxHash={historyDetailsTxHash} />
              ) : (
                <HistoryTable
                  onPageChange={setCurrentPage}
                  onRowClick={handleRowClick}
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
