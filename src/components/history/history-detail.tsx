import { ChainConfig, HistoryRecord } from "@/types";
import { formatBalance, formatTime, getChainConfig, getChainLogoSrc, toShortAdrress } from "@/utils";
import Image from "next/image";
import { Hex } from "viem";

type TData = Pick<
  HistoryRecord,
  | "requestTxHash"
  | "responseTxHash"
  | "fromChain"
  | "toChain"
  | "startTime"
  | "sendToken"
  | "sendAmount"
  | "confirmedBlocks"
  | "result"
  | "id"
>;

interface Props {
  data: TData;
}

export default function HistoryDetail({ data }: Props) {
  const sourceChain = getChainConfig(data.fromChain);
  const targetChain = getChainConfig(data.toChain);
  const sourceToken = sourceChain?.tokens.find(({ symbol }) => symbol === data.sendToken);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="w-[39.5rem] px-5">
        <div className="flex flex-col gap-3 text-sm font-normal">
          <Row label="Timestamp" value={formatTime(data.startTime * 1000)} />
          <Row
            label="Value"
            value={
              sourceToken
                ? `${formatBalance(BigInt(data.sendAmount), sourceToken.decimals, { precision: 8 })} ${
                    sourceToken.symbol
                  }`
                : undefined
            }
          />
        </div>

        <div className="mt-8 flex justify-between rounded-3xl bg-white/5 px-14 py-10">
          <Column chain={sourceChain} tx={data.requestTxHash} />
          <Bridge />
          <Column chain={targetChain} tx={data.responseTxHash} />
        </div>

        <div className="mt-2 inline-flex w-full justify-end pr-2">
          <a
            className="text-sm font-light text-white underline transition-colors hover:text-primary"
            target="_blank"
            href={`records/${data.id}`}
            rel="noopener noreferrer"
          >
            {`More`}
          </a>
        </div>
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
      <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/5">
        {chain ? <Image alt={chain.name} width={64} height={64} src={getChainLogoSrc(chain.logo)} /> : "-"}
      </div>
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
        <span>-</span>
      )}
    </div>
  );
}

function Bridge() {
  return (
    <div className="flex items-center justify-center">
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
    </div>
  );
}
