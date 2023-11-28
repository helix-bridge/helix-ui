import { BaseBridge } from "@/bridges";
import { GQL_HISTORY_RECORD_BY_TX_HASH } from "@/config";
import { useTransfer } from "@/hooks";
import {
  ChainConfig,
  HistoryRecordByTxHashReqParams,
  HistoryRecordByTxHashResData,
  InputValue,
  RecordResult,
  SortedLnV20RelayInfosResData,
  Token,
} from "@/types";
import ProgressIcon from "@/ui/progress-icon";
import { formatBalance, getChainLogoSrc, notifyError } from "@/utils";
import { ApolloQueryResult, useQuery } from "@apollo/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Address, Hex, parseUnits } from "viem";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  sender?: `0x${string}` | null;
  recipient?: `0x${string}` | null;
  transferAmount: InputValue<bigint>;
  isOpen: boolean;
  onClose: () => void;
  refetchRelayers: () => Promise<ApolloQueryResult<SortedLnV20RelayInfosResData>>;
}

export default function TransferModal({ sender, recipient, transferAmount, isOpen, onClose, refetchRelayers }: Props) {
  const { bridgeInstance, sourceChain, targetChain, sourceToken, targetToken, bridgeFee, transfer } = useTransfer();
  const [txHash, setTxHash] = useState<Hex>("0x");
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { data: txProgressData } = useQuery<HistoryRecordByTxHashResData, HistoryRecordByTxHashReqParams>(
    GQL_HISTORY_RECORD_BY_TX_HASH,
    {
      variables: { txHash },
      pollInterval: txHash === "0x" ? 0 : 300,
      skip: txHash === "0x",
    },
  );

  const handleTransfer = useCallback(async () => {
    if (sender && recipient && sourceChain && bridgeInstance) {
      setBusy(true);
      try {
        const relayer = bridgeInstance.isLnBridge()
          ? (await refetchRelayers()).data.sortedLnv20RelayInfos?.records.at(0)
          : undefined;
        const receipt = await transfer(sender, recipient, transferAmount.value, bridgeInstance, sourceChain, {
          relayer: relayer?.relayer,
          transferId: relayer?.lastTransferId,
          totalFee: (
            await bridgeInstance.getFee({
              baseFee: BigInt(relayer?.baseFee || 0),
              protocolFee: BigInt(relayer?.protocolFee || 0),
              liquidityFeeRate: BigInt(relayer?.liquidityFeeRate || 0),
              transferAmount: transferAmount.value,
            })
          )?.value,
          withdrawNonce: BigInt(relayer?.withdrawNonce || 0),
          depositedMargin: BigInt(relayer?.margin || 0),
        });

        if (receipt?.status === "success") {
          setTxHash(receipt.transactionHash);
          setDisabled(true);
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
      } finally {
        setBusy(false);
      }
    }
  }, [sender, recipient, sourceChain, transferAmount, bridgeInstance, transfer, refetchRelayers]);

  // Reset state
  useEffect(() => {
    if (isOpen) {
      //
    } else {
      setTxHash("0x");
      setBusy(false);
      setDisabled(false);
    }
  }, [isOpen]);

  return (
    <Modal
      title="Transfer Summary"
      isOpen={isOpen}
      className="w-full lg:w-[34rem]"
      okText="Confirm"
      disabledCancel={busy || disabled}
      disabledOk={disabled}
      busy={busy}
      forceFooterHidden={txHash === "0x" ? false : true}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleTransfer}
    >
      {/* From-To */}
      <div className="gap-small flex flex-col">
        <SourceTarget
          type="source"
          address={sender}
          chain={sourceChain}
          token={sourceToken}
          transferAmount={transferAmount}
        />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget
          type="target"
          address={recipient}
          chain={targetChain}
          token={targetToken}
          transferAmount={transferAmount}
        />
      </div>

      {/* information */}
      <div className="gap-middle flex flex-col">
        <span className="text-sm font-extrabold text-white">Information</span>
        <Information fee={bridgeFee} bridge={bridgeInstance} />
      </div>

      {txHash ? (
        <div className="px-middle bg-inner rounded-middle flex h-10 items-center">
          <Progress
            confirmedBlocks={txProgressData?.historyRecordByTxHash?.confirmedBlocks}
            result={txProgressData?.historyRecordByTxHash?.result}
            id={txProgressData?.historyRecordByTxHash?.id}
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
  transferAmount,
}: {
  type: "source" | "target";
  transferAmount: InputValue<bigint>;
  chain?: ChainConfig;
  token?: Token;
  address?: Address | null;
}) {
  return chain && token ? (
    <div className="bg-inner p-middle rounded-middle flex items-center justify-between lg:p-5">
      {/* Left */}
      <div className="gap-middle flex items-center">
        <Image width={36} height={36} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
        <div className="flex flex-col items-start">
          <span className="text-base font-medium text-white">{chain.name}</span>
          <span className="text-sm font-medium text-white/50">{address}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(parseUnits(transferAmount.input, token.decimals), token.decimals)}
        </span>
        <span className="text-sm font-medium text-white">{token.symbol}</span>
      </div>
    </div>
  ) : null;
}

function Information({ fee, bridge }: { fee?: { value: bigint; token: Token }; bridge?: BaseBridge | null }) {
  return (
    <div className="p-middle bg-inner gap-small rounded-middle flex flex-col">
      <Item
        label="Transaction Fee"
        value={
          fee
            ? `${formatBalance(fee.value, fee.token.decimals, { precision: 6, keepZero: false })} ${fee.token.symbol}`
            : null
        }
      />
      <Item label="Estimated Arrival Time" value={bridge?.formatEstimateTime()} />
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="gap-middle flex items-center justify-between text-sm font-medium text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function Progress({
  confirmedBlocks,
  result,
  id,
}: {
  confirmedBlocks: string | null | undefined;
  result: RecordResult | null | undefined;
  id: string | null | undefined;
}) {
  const splited = confirmedBlocks?.split("/");
  if (splited?.length === 2) {
    const finished = Number(splited[0]);
    const total = Number(splited[1]);

    if (finished === total || result === RecordResult.SUCCESS) {
      return (
        <div className="flex w-full items-center justify-between">
          <div className="inline-flex">
            <span className="text-sm font-medium">LnProvider relay finished. Go to&nbsp;</span>
            <Link href={`/records/${id}`} className="text-primary text-sm font-medium hover:underline">
              Detail
            </Link>
          </div>
          <Image width={20} height={20} alt="Finished" src="/images/finished.svg" />
        </div>
      );
    } else {
      return (
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium">{`Waiting for LnProvider relay message(${confirmedBlocks})`}</span>
          <ProgressIcon percent={(finished * 100) / total} />
        </div>
      );
    }
  } else {
    return (
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-medium">Waiting for indexing...</span>
        <ProgressIcon percent={10} />
      </div>
    );
  }
}
