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
import { Hash, Hex, isHash } from "viem";
import Completed from "../icons/completed";
import Pending from "../icons/pending";
import { useHistoryDetails } from "../../hooks";
import ComponentLoading from "../../ui/component-loading";
import { useMemo } from "react";

interface Props {
  data: Partial<HistoryDetailsResData["historyRecordByTxHash"]>;
}

export default function HistoryDetails({ data: propsData }: Props) {
  const { data: _data, loading } = useHistoryDetails(propsData?.id ? null : propsData?.requestTxHash);
  const data = useMemo(() => _data ?? propsData, [_data, propsData]);

  const sourceChain = getChainConfig(data?.fromChain);
  const targetChain = getChainConfig(data?.toChain);
  const sourceToken = sourceChain?.tokens.find(({ symbol }) => symbol.toUpperCase() === data?.sendToken?.toUpperCase());

  return (
    <div className="relative overflow-x-auto pb-2">
      <ComponentLoading loading={loading} color="white" className="backdrop-blur-[2px]" />

      <div className="w-[39.5rem] px-5">
        <div className="flex flex-col gap-3 text-sm font-normal">
          <Row label="Timestamp" value={data?.startTime ? formatTime(data.startTime * 1000) : undefined} />
          <Row
            label="Value"
            value={
              data?.sendAmount && sourceToken
                ? `${formatBalance(BigInt(data.sendAmount), sourceToken.decimals, { precision: 8 })} ${
                    sourceToken.symbol
                  }`
                : undefined
            }
          />
        </div>

        <div className="mt-8 flex justify-between rounded-3xl bg-white/5 px-14 py-10">
          <Column chain={sourceChain} tx={data?.requestTxHash} completed={!!data?.requestTxHash} />
          <Bridge data={data} />
          <Column
            chain={targetChain}
            completed={data?.result === RecordResult.SUCCESS}
            tx={isHash(data?.confirmedBlocks ?? "") ? (data?.confirmedBlocks as Hash) : data?.responseTxHash}
          />
        </div>

        {data && (
          <div className="mt-2 inline-flex w-full justify-end pr-2">
            <Link
              className="hover:text-primary text-sm font-light text-white underline transition-colors"
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

function Column({ completed, chain, tx }: { completed: boolean; chain?: ChainConfig; tx?: Hex | null }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-sm font-bold text-white">{chain?.name ?? "-"}</span>
      <div className="border-primary/25 flex h-28 w-28 items-center justify-center rounded-full border">
        {chain ? (
          <img alt={chain.name} width={64} height={64} src={getChainLogoSrc(chain.logo)} className="rounded-full" />
        ) : (
          "-"
        )}
      </div>
      <div className="inline-flex min-h-7 min-w-36 items-center justify-center gap-1">
        {completed ? <Completed width={18} height={18} /> : <Pending width={25} height={25} />}
        {chain && tx ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={new URL(`tx/${tx}`, chain.blockExplorers?.default.url).href}
            className="hover:text-primary text-sm font-normal text-white underline transition-colors"
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

function Bridge({ data }: { data?: Partial<Pick<HistoryRecord, "confirmedBlocks" | "result">> | null }) {
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
