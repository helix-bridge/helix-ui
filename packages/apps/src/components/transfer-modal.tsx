import { BaseBridge } from "@/bridges/base";
import { ChainToken } from "@/types/misc";
import { RelayersResponseData } from "@/types/graphql";
import Modal from "@/ui/modal";
import { formatBalance } from "@/utils/balance";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc } from "@/utils/misc";
import { ApolloQueryResult } from "@apollo/client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { TransferValue } from "./transfer-input";
import { notification } from "@/ui/notification";
import { parseUnits } from "viem";
import { Token } from "@/types/token";

interface Props {
  fee?: { value: bigint; token: Token };
  sender?: `0x${string}` | null;
  recipient?: `0x${string}` | null;
  bridge?: BaseBridge | null;
  sourceValue?: ChainToken | null;
  targetValue?: ChainToken | null;
  transferValue: TransferValue;
  isOpen: boolean;

  onClose: () => void;
  onSuccess: () => void;
  onAllowanceChange: (value: bigint) => void;
  refetchRelayers: () => Promise<ApolloQueryResult<RelayersResponseData>>;
}

export default function TransferModal({
  fee,
  sender,
  recipient,
  bridge,
  sourceValue,
  targetValue,
  transferValue,
  isOpen,
  onClose,
  onSuccess,
  onAllowanceChange,
  refetchRelayers,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleTransfer = useCallback(async () => {
    const sourceChain = getChainConfig(sourceValue?.network);
    const targetChain = getChainConfig(targetValue?.network);
    const sourceToken = sourceChain?.tokens.find(({ symbol }) => sourceValue?.symbol === symbol);
    const targetToken = targetChain?.tokens.find(({ symbol }) => targetValue?.symbol === symbol);

    if (bridge && sender && recipient && sourceChain && targetChain && sourceToken && targetToken) {
      try {
        setBusy(true);
        const relayer = (await refetchRelayers()).data.sortedLnv20RelayInfos?.at(0);
        const receipt = await bridge.transfer(sender, recipient, transferValue.formatted, {
          remoteChainId: BigInt(targetChain.id),
          relayer: relayer?.relayer,
          sourceToken: sourceToken.address,
          targetToken: targetToken.address,
          transferId: relayer?.lastTransferId,
          totalFee: await bridge.getFee({
            baseFee: BigInt(relayer?.baseFee || 0),
            liquidityFeeRate: BigInt(relayer?.liquidityFeeRate || 0),
            transferAmount: transferValue.formatted,
          }),
          withdrawNonce: BigInt(relayer?.withdrawNonce || 0),
          depositedMargin: BigInt(relayer?.margin || 0),
        });
        const href = new URL(`tx/${receipt?.transactionHash}`, sourceChain?.blockExplorers?.default.url).href;

        if (receipt?.status === "success") {
          notification.success({
            title: "Transfer successfully",
            description: (
              <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
                {receipt.transactionHash}
              </a>
            ),
          });

          bridge.getAllowance(sender).then(onAllowanceChange).catch(console.error);
          onSuccess();
        } else if (receipt?.status === "reverted") {
          notification.warn({
            title: "Transfer failed",
            description: (
              <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
                {receipt.transactionHash}
              </a>
            ),
          });
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Transfer failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [
    bridge,
    sender,
    recipient,
    transferValue,
    sourceValue,
    targetValue,
    onSuccess,
    onAllowanceChange,
    refetchRelayers,
  ]);

  return (
    <Modal
      title="Confirm Transfer"
      isOpen={isOpen}
      className="w-full lg:w-[38rem]"
      okText="Confirm"
      disabledCancel={busy}
      busy={busy}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleTransfer}
    >
      {/* from-to */}
      <div className="gap-small flex flex-col">
        <SourceTarget type="source" chainToken={sourceValue} transferValue={transferValue} />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget type="target" chainToken={targetValue} transferValue={transferValue} />
      </div>

      {/* information */}
      <div className="gap-middle flex flex-col">
        <span className="text-sm font-normal text-white">Information</span>
        <Information fee={fee} bridge={bridge} sender={sender} recipient={recipient} />
      </div>
    </Modal>
  );
}

function SourceTarget({
  type,
  transferValue,
  chainToken,
}: {
  type: "source" | "target";
  transferValue: TransferValue;
  chainToken?: ChainToken | null;
}) {
  const chainConfig = getChainConfig(chainToken?.network);
  const token = chainConfig?.tokens.find(({ symbol }) => chainToken?.symbol === symbol);

  return chainConfig && token ? (
    <div className="bg-app-bg p-middle flex items-center justify-between rounded lg:p-5">
      {/* left */}
      <div className="gap-middle flex items-center">
        <Image
          width={36}
          height={36}
          alt="Chain"
          src={getChainLogoSrc(chainConfig.logo)}
          className="shrink-0 rounded-full"
        />
        <div className="flex flex-col items-start">
          <span className="text-base font-medium text-white">{chainConfig.name}</span>
          <span className="text-sm font-medium text-white/40">
            {type === "source" ? "Source Chain" : "Target Chain"}
          </span>
        </div>
      </div>

      {/* right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(parseUnits(transferValue.value, token.decimals), token.decimals, { keepZero: false })}
        </span>
        <span className="text-sm font-medium text-white">{token.symbol}</span>
      </div>
    </div>
  ) : null;
}

function Information({
  fee,
  bridge,
  sender,
  recipient,
}: {
  fee?: { value: bigint; token: Token };
  bridge?: BaseBridge | null;
  sender?: string | null;
  recipient?: string | null;
}) {
  return (
    <div className="p-middle bg-app-bg gap-small flex flex-col rounded">
      <Item label="Bridge" value={bridge?.getInfo().name} />
      <Item label="From" value={sender} />
      <Item label="To" value={recipient} />
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
