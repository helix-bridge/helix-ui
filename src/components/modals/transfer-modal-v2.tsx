import { BaseBridge } from "@/bridges";
import { GQL_HISTORY_RECORD_BY_TX_HASH } from "@/config";
import { useApp } from "@/hooks";
import {
  ChainConfig,
  HistoryRecordByTxHashReqParams,
  HistoryRecordByTxHashResData,
  RecordResult,
  Token,
} from "@/types";
import ProgressIcon from "@/ui/progress-icon";
import { formatBalance, getChainLogoSrc, toShortAdrress } from "@/utils";
import { useQuery } from "@apollo/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Address, Hex, isHex } from "viem";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  sender?: `0x${string}` | null;
  recipient?: `0x${string}` | null;
  sourceChain: ChainConfig;
  sourceToken: Token;
  targetChain: ChainConfig;
  targetToken: Token;
  txHash: Hex | null | undefined;
  fee: { token: Token; value: bigint } | null | undefined;
  bridge: BaseBridge | undefined;
  amount: bigint;
  busy: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TransferModalV2({
  sender,
  recipient,
  busy,
  fee,
  bridge,
  sourceChain,
  sourceToken,
  targetChain,
  targetToken,
  txHash,
  amount,
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  const { data: txProgressData } = useQuery<HistoryRecordByTxHashResData, HistoryRecordByTxHashReqParams>(
    GQL_HISTORY_RECORD_BY_TX_HASH,
    {
      variables: { txHash: txHash ?? "0x" },
      pollInterval: txHash ? 300 : 0,
      skip: !txHash,
    },
  );
  const { updateBalances } = useApp();

  return (
    <Modal
      title="Transfer Summary"
      isOpen={isOpen}
      className="w-full lg:w-[34rem]"
      okText="Confirm"
      disabledCancel={busy}
      busy={busy}
      forceFooterHidden={!!txHash}
      onClose={onClose}
      onCancel={onClose}
      onOk={onConfirm}
    >
      {/* From-To */}
      <div className="flex flex-col gap-small">
        <SourceTarget type="source" address={sender} chain={sourceChain} token={sourceToken} amount={amount} />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget type="target" address={recipient} chain={targetChain} token={targetToken} amount={amount} />
      </div>

      {/* information */}
      <div className="flex flex-col gap-medium">
        <span className="text-sm font-extrabold text-white/50">Information</span>
        <Information fee={fee} bridge={bridge} />
      </div>

      {txHash ? (
        <div className="flex h-12 items-center rounded-large bg-inner px-5">
          <Progress
            confirmedBlocks={txProgressData?.historyRecordByTxHash?.confirmedBlocks}
            result={txProgressData?.historyRecordByTxHash?.result}
            id={txProgressData?.historyRecordByTxHash?.id}
            onFinished={updateBalances}
          />
        </div>
      ) : null}
    </Modal>
  );
}

function SourceTarget({
  type,
  address,
  chain,
  token,
  amount,
}: {
  type: "source" | "target";
  amount: bigint;
  chain?: ChainConfig;
  token?: Token;
  address?: Address | null;
}) {
  return chain && token ? (
    <div className="flex items-center justify-between rounded-3xl bg-inner p-5">
      {/* Left */}
      <div className="flex items-center gap-medium">
        <Image width={36} height={36} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
        <div className="flex flex-col items-start">
          <span className="text-base font-extrabold text-white">{chain.name}</span>
          <span className="hidden text-sm font-medium text-white/50 lg:inline">{address}</span>
          {address ? (
            <span className="text-sm font-medium text-white/50 lg:hidden">{toShortAdrress(address, 8, 6)}</span>
          ) : null}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(amount, token.decimals)}
        </span>
        <span className="text-sm font-extrabold text-white">{token.symbol}</span>
      </div>
    </div>
  ) : null;
}

function Information({ fee, bridge }: { fee?: { value: bigint; token: Token } | null; bridge?: BaseBridge | null }) {
  return (
    <div className="flex flex-col gap-small rounded-3xl bg-inner p-5">
      <Item
        label="Transaction Fee"
        value={fee ? `${formatBalance(fee.value, fee.token.decimals, { precision: 6 })} ${fee.token.symbol}` : null}
      />
      <Item label="Estimated Arrival Time" value={bridge?.formatEstimateTime()} />
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-medium text-sm font-extrabold text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function Progress({
  confirmedBlocks,
  result,
  id,
  onFinished = () => undefined,
}: {
  confirmedBlocks: string | null | undefined;
  result: RecordResult | null | undefined;
  id: string | null | undefined;
  onFinished?: () => void;
}) {
  const splited = isHex(confirmedBlocks) ? [1, 1] : confirmedBlocks?.split("/");
  if (splited?.length === 2) {
    const finished = Number(splited[0]);
    const total = Number(splited[1]);

    if (finished === total || result === RecordResult.SUCCESS) {
      onFinished();
      return (
        <div className="flex w-full items-center justify-between">
          <div className="inline-flex">
            <span className="text-sm font-extrabold">LnProvider relay finished. Go to&nbsp;</span>
            <Link href={`/records/${id}`} className="text-sm font-extrabold text-primary hover:underline">
              Detail
            </Link>
          </div>
          <Image width={20} height={20} alt="Finished" src="/images/finished.svg" />
        </div>
      );
    } else {
      return (
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-extrabold">{`Waiting for LnProvider relay message(${confirmedBlocks})`}</span>
          <ProgressIcon percent={(finished * 100) / total} />
        </div>
      );
    }
  } else {
    return (
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-extrabold">Waiting for indexing...</span>
        <ProgressIcon percent={10} />
      </div>
    );
  }
}
