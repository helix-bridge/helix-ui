import { Link } from "react-router-dom";
import { ChainConfig, HistoryDetailsResData, HistoryRecord, RecordResult } from "../../types";
import {
  formatBalance,
  formatTime,
  getChainConfig,
  getChainLogoSrc,
  parseConfirmedBlocks,
  toShortAdrress,
} from "../../utils";
import { Hash, Hex } from "viem";
import Completed from "../icons/completed";
import Pending from "../icons/pending";
import { useHistoryDtails } from "../../hooks";
import ComponentLoading from "../../ui/component-loading";
import { useMemo } from "react";

interface Props {
  requestTxHash?: Hash | null;
  defaultData?: HistoryDetailsResData["historyRecordByTxHash"];
}

export default function HistoryDetails({ defaultData, requestTxHash }: Props) {
  const { data: _data, loading } = useHistoryDtails(requestTxHash);
  const data = useMemo(() => _data ?? defaultData, [_data, defaultData]);

  const sourceChain = getChainConfig(data?.fromChain);
  const targetChain = getChainConfig(data?.toChain);
  const sourceToken = sourceChain?.tokens.find(({ symbol }) => symbol === data?.sendToken);

  return (
    <div className="relative overflow-x-auto pb-2">
      <ComponentLoading loading={loading} color="white" className="backdrop-blur-[2px]" />

      <div className="w-[39.5rem] px-5">
        <div className="flex flex-col gap-3 text-sm font-normal">
          <Row label="Timestamp" value={data ? formatTime(data.startTime * 1000) : undefined} />
          <Row
            label="Value"
            value={
              data && sourceToken
                ? `${formatBalance(BigInt(data.sendAmount), sourceToken.decimals, { precision: 8 })} ${
                    sourceToken.symbol
                  }`
                : undefined
            }
          />
        </div>

        <div className="mt-8 flex justify-between rounded-3xl bg-white/5 px-14 py-10">
          <Column chain={sourceChain} tx={data?.requestTxHash} />
          <Bridge data={data} />
          <Column chain={targetChain} tx={data?.responseTxHash} />
        </div>

        {data && (
          <div className="mt-2 inline-flex w-full justify-end pr-2">
            <Link
              className="text-sm font-light text-white underline transition-colors hover:text-primary"
              target="_blank"
              to={`/tx/${data.id}`}
              rel="noopener noreferrer"
            >
              {`More`}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="inline-block">
      <span className="inline-block w-24 font-medium">{label}</span>
      <span className="text-white/90">{value}</span>
    </div>
  );
}

function Column({ chain, tx }: { chain?: ChainConfig; tx?: Hex | null }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-sm font-bold text-white">{chain?.name ?? "-"}</span>
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/25">
        {tx ? null : (
          <div
            className="absolute bottom-0 left-0 right-0 top-0 z-10 animate-spin rounded-full border-y border-white"
            style={{ animationDuration: "2s" }}
          />
        )}
        {chain ? <img alt={chain.name} width={64} height={64} src={getChainLogoSrc(chain.logo)} /> : "-"}
      </div>
      <div className="inline-flex min-h-7 min-w-36 items-center justify-center gap-1">
        {tx ? <Completed width={18} height={18} /> : <Pending width={25} height={25} />}
        {chain && tx ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={new URL(`tx/${tx}`, chain.blockExplorers?.default.url).href}
            className="text-sm font-normal text-white underline transition-colors hover:text-primary"
          >
            Tx: {toShortAdrress(tx)}
          </a>
        ) : (
          <span className="ellipsis ml-2">.</span>
        )}
      </div>
    </div>
  );
}

function Bridge({ data }: { data?: Pick<HistoryRecord, "confirmedBlocks" | "result"> | null }) {
  const { hash, total = 0, completed = 0 } = parseConfirmedBlocks(data?.confirmedBlocks);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {data?.result === RecordResult.SUCCESS ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path
            opacity="0.5"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.5 17V36L2 55V36L35.5 17ZM69 17V36L35.5 55V36L69 17Z"
            fill="#FFFFFF"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2 17L35.5 36V55L2 36V17ZM35.5 17L69 36V55L35.5 36V17Z"
            fill="#FFFFFF"
          />
        </svg>
      ) : (
        <>
          <div className="scale-[0.7]">
            <span className="tx-in-progress" />
          </div>
          <span className="text-sm font-normal italic text-white">
            &nbsp;{total + completed ? `${completed} / ${total}` : hash ? "Finishing" : ""}&nbsp;
          </span>
        </>
      )}
    </div>
  );
}
