import { useCallback, useEffect, useMemo, useState } from "react";
import { bridgeFactory } from "@/utils/bridge";
import { interval } from "rxjs";
import { formatCountdown } from "@/utils/time";
import Button from "@/ui/button";
import { useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { getChainConfig } from "@/utils/chain";
import { notification } from "@/ui/notification";
import { notifyTransaction } from "@/utils/notification";
import { BalanceInput } from "./balance-input";
import { formatBalance } from "@/utils/balance";
import dynamic from "next/dynamic";
import { HistoryRecord, InputValue, RecordResult } from "@/types";
import { RecordResultTag } from "@/ui/record-result-tag";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });
interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionStatus({ record }: Props) {
  const [speedUpFee, setSpeedUpFee] = useState<InputValue<bigint>>({ valid: true, input: "", value: 0n });
  const [countdown, setCountdown] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useSwitchNetwork();

  const { sourceChain, targetChain, sourceToken, targetToken } = useMemo(() => {
    const sourceChain = getChainConfig(record?.fromChain);
    const targetChain = getChainConfig(record?.toChain);
    const sourceToken = sourceChain?.tokens.find((t) => t.symbol === record?.sendToken);
    const targetToken = targetChain?.tokens.find((t) => t.symbol === record?.recvToken);
    return { sourceChain, targetChain, sourceToken, targetToken };
  }, [record]);

  const handleClaim = useCallback(async () => {
    if (chain?.id !== targetChain?.id) {
      switchNetwork?.(targetChain?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        publicClient,
        walletClient,
      });

      try {
        setBusy(true);
        const receipt = await bridge?.claim(record);
        notifyTransaction(receipt, targetChain);
      } catch (err) {
        console.error(err);
        notification.error({ title: "Claim failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [chain, record, sourceChain, targetChain, sourceToken, targetToken, publicClient, walletClient, switchNetwork]);

  const handleRefund = useCallback(async () => {
    if (chain?.id !== targetChain?.id) {
      switchNetwork?.(targetChain?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        publicClient,
        walletClient,
      });

      try {
        setBusy(true);
        const receipt = await bridge?.refund(record);
        notifyTransaction(receipt, targetChain);
      } catch (err) {
        console.error(err);
        notification.error({ title: "Refund failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [chain, record, sourceChain, targetChain, sourceToken, targetToken, publicClient, walletClient, switchNetwork]);

  const handleSpeedUp = useCallback(async () => {
    if (chain?.id !== sourceChain?.id) {
      switchNetwork?.(sourceChain?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        publicClient,
        walletClient,
      });
      const o = BigInt(record.fee); // old
      const n = speedUpFee.value; // new

      try {
        setBusy(true);
        const receipt = await bridge?.speedUp(record, n > o ? n - o : 0n);
        notifyTransaction(receipt, sourceChain);
        if (receipt?.status === "success") {
          setIsOpen(false);
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Refund failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [
    chain,
    record,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    speedUpFee,
    publicClient,
    walletClient,
    switchNetwork,
  ]);

  useEffect(() => {
    const sub$$ = interval(1000).subscribe(() => setCountdown((prev) => (prev > 0 ? prev - 1000 : 0)));
    return () => sub$$.unsubscribe();
  }, []);

  useEffect(() => {
    if (record?.bridge) {
      const startTime = record ? record.startTime * 1000 : Date.now();
      const minTime = (bridgeFactory({ category: record.bridge })?.getEstimateTime().min || 3) * 60 * 1000;
      const token = getChainConfig(record.fromChain)?.tokens.find((t) => t.symbol === record.sendToken);
      const value = BigInt(record.fee);

      if (token) {
        setSpeedUpFee({ value, input: formatBalance(value, token.decimals), valid: true });
      }
      setCountdown(minTime);
      setIsTimeout(Date.now() - startTime > minTime);
    } else {
      setCountdown(0);
      setIsTimeout(false);
    }
  }, [record]);

  return (
    <>
      <div className="flex items-center gap-medium">
        <RecordResultTag result={record?.result} />

        {record?.result === RecordResult.PENDING && (
          <div className="inline text-sm font-medium text-white/50">
            {isTimeout ? (
              <span>
                It seems to be taking longer than usual.{" "}
                <a
                  href={`mailto:hello@helixbridge.app?subject=${encodeURIComponent(
                    "Transfer time out",
                  )}&body=${encodeURIComponent(location.href)}`}
                  rel="noreferrer"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Contact us
                </a>{" "}
                for support.
              </span>
            ) : (
              `Estimated to wait ${formatCountdown(countdown)}`
            )}
          </div>
        )}

        {record?.result === RecordResult.PENDING_TO_CLAIM && (
          <div className="flex items-center gap-small">
            <span className="text-sm font-medium text-white/50">Please claim the tokens on the target chain.</span>
            <Button className="rounded-medium px-1" kind="primary" busy={busy} onClick={handleClaim}>
              <span className="text-sm font-medium text-white">Claim</span>
            </Button>
          </div>
        )}

        {record?.result === RecordResult.PENDING_TO_REFUND && (
          <div className="flex items-center gap-small">
            <span className="text-sm font-medium text-white/50">Please request refund on the target chain.</span>
            <Button className="rounded-medium px-1" kind="primary" busy={busy} onClick={handleRefund}>
              <span className="text-sm font-medium text-white">Refund</span>
            </Button>
          </div>
        )}

        {record?.result === RecordResult.PENDING && record.bridge.startsWith("lpbridge") && (
          <div className="flex items-center gap-small">
            <span className="text-sm font-medium text-white/50">
              You can request refund or speed up this transaction.
            </span>
            <Button className="rounded-medium px-1" kind="primary" busy={busy} onClick={handleRefund}>
              <span className="text-sm font-medium text-white">Refund</span>
            </Button>
            <Button className="rounded-medium px-1" kind="primary" onClick={() => setIsOpen(true)}>
              <span className="text-sm font-medium text-white">SpeedUp</span>
            </Button>
          </div>
        )}
      </div>

      <Modal
        className="w-full lg:w-[30rem]"
        disabledCancel={busy}
        busy={busy}
        isOpen={isOpen}
        title="Speed Up"
        okText="Confirm"
        onClose={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        onOk={handleSpeedUp}
      >
        <BalanceInput
          compact
          placeholder="Enter new fee"
          value={speedUpFee}
          token={sourceToken}
          onChange={setSpeedUpFee}
        />
      </Modal>
    </>
  );
}
