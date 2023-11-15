import { BaseBridge } from "@/bridges/base";
import { ChainToken } from "@/types/misc";
import { RelayersResponseData } from "@/types/graphql";
import { formatBalance } from "@/utils/balance";
import { getChainLogoSrc } from "@/utils/misc";
import { ApolloQueryResult } from "@apollo/client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { TransferValue } from "./transfer-input";
import { notification } from "@/ui/notification";
import { Address, parseUnits } from "viem";
import { Token } from "@/types/token";
import { useTransfer } from "@/hooks/use-transfer";
import dynamic from "next/dynamic";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });
interface Props {
  sender?: `0x${string}` | null;
  recipient?: `0x${string}` | null;
  transferValue: TransferValue;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  refetchRelayers: () => Promise<ApolloQueryResult<RelayersResponseData>>;
}

export default function TransferModal({
  sender,
  recipient,
  transferValue,
  isOpen,
  onClose,
  onSuccess,
  refetchRelayers,
}: Props) {
  const { bridgeClient, sourceValue, targetValue, fee, transfer } = useTransfer();
  const [busy, setBusy] = useState(false);

  const handleTransfer = useCallback(async () => {
    if (sender && recipient && bridgeClient) {
      try {
        setBusy(true);
        const relayer = bridgeClient.isLnBridge()
          ? (await refetchRelayers()).data.sortedLnv20RelayInfos?.records.at(0)
          : undefined;
        const receipt = await transfer(sender, recipient, transferValue.formatted, {
          relayer: relayer?.relayer,
          transferId: relayer?.lastTransferId,
          totalFee: (
            await bridgeClient.getFee({
              baseFee: BigInt(relayer?.baseFee || 0),
              protocolFee: BigInt(relayer?.protocolFee || 0),
              liquidityFeeRate: BigInt(relayer?.liquidityFeeRate || 0),
              transferAmount: transferValue.formatted,
            })
          )?.value,
          withdrawNonce: BigInt(relayer?.withdrawNonce || 0),
          depositedMargin: BigInt(relayer?.margin || 0),
        });

        if (receipt?.status === "success") {
          onSuccess();
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Transfer failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [bridgeClient, onSuccess, recipient, refetchRelayers, sender, transfer, transferValue]);

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
        <SourceTarget type="source" address={sender} chainToken={sourceValue} transferValue={transferValue} />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget type="target" address={recipient} chainToken={targetValue} transferValue={transferValue} />
      </div>

      {/* information */}
      <div className="gap-middle flex flex-col">
        <span className="text-sm font-normal text-white">Information</span>
        <Information fee={fee} bridge={bridgeClient} />
      </div>
    </Modal>
  );
}

function SourceTarget({
  type,
  address,
  transferValue,
  chainToken,
}: {
  type: "source" | "target";
  transferValue: TransferValue;
  chainToken?: ChainToken | null;
  address?: Address | null;
}) {
  return chainToken ? (
    <div className="bg-app-bg p-middle flex items-center justify-between rounded lg:p-5">
      {/* left */}
      <div className="gap-middle flex items-center">
        <Image
          width={36}
          height={36}
          alt="Chain"
          src={getChainLogoSrc(chainToken.chain.logo)}
          className="shrink-0 rounded-full"
        />
        <div className="flex flex-col items-start">
          <span className="text-base font-medium text-white">{chainToken.chain.name}</span>
          <span className="text-sm font-medium text-white/50">{address}</span>
        </div>
      </div>

      {/* right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(parseUnits(transferValue.value, chainToken.token.decimals), chainToken.token.decimals)}
        </span>
        <span className="text-sm font-medium text-white">{chainToken.token.symbol}</span>
      </div>
    </div>
  ) : null;
}

function Information({ fee, bridge }: { fee?: { value: bigint; token: Token }; bridge?: BaseBridge | null }) {
  return (
    <div className="p-middle bg-app-bg gap-small flex flex-col rounded">
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
