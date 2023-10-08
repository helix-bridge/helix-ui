import { HistoryRecord, RecordStatus } from "@/types/graphql";
import { StatusTag } from "./status-tag";
import { useCallback, useEffect, useState } from "react";
import { bridgeFactory } from "@/utils/bridge";
import { interval } from "rxjs";
import { formatCountdown } from "@/utils/time";
import Button from "@/ui/button";
import { useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { getChainConfig } from "@/utils/chain";
import { notification } from "@/ui/notification";
import { notifyTransaction } from "@/utils/notification";
import Modal from "@/ui/modal";
import { BalanceInput } from "./balance-input";
import { formatUnits } from "viem";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionStatus({ record }: Props) {
  const [speedUpFee, setSpeedUpFee] = useState({ formatted: 0n, value: "" });
  const [countdown, setCountdown] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useSwitchNetwork();

  const handleClaim = useCallback(async () => {
    const chainConfig = getChainConfig(record?.toChain);

    if (chain?.id !== chainConfig?.id) {
      switchNetwork?.(chainConfig?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain: record.fromChain,
        targetChain: record.toChain,
        sourceToken: record.sendToken,
        targetToken: record.recvToken,
        publicClient,
        walletClient,
      });

      try {
        setBusy(true);
        const receipt = await bridge?.claim(record);
        notifyTransaction(receipt, record.toChain);
      } catch (err) {
        console.error(err);
        notification.error({ title: "Claim failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [chain, record, publicClient, walletClient, switchNetwork]);

  const handleRefund = useCallback(async () => {
    const chainConfig = getChainConfig(record?.fromChain);

    if (chain?.id !== chainConfig?.id) {
      switchNetwork?.(chainConfig?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain: record.fromChain,
        targetChain: record.toChain,
        sourceToken: record.sendToken,
        targetToken: record.recvToken,
        publicClient,
        walletClient,
      });

      try {
        setBusy(true);
        const receipt = await bridge?.refund(record);
        notifyTransaction(receipt, record.toChain);
      } catch (err) {
        console.error(err);
        notification.error({ title: "Refund failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [chain, record, publicClient, walletClient, switchNetwork]);

  const handleSpeedUp = useCallback(async () => {
    const chainConfig = getChainConfig(record?.fromChain);

    if (chain?.id !== chainConfig?.id) {
      switchNetwork?.(chainConfig?.id);
    } else if (record?.bridge) {
      const bridge = bridgeFactory({
        category: record.bridge,
        sourceChain: record.fromChain,
        targetChain: record.toChain,
        sourceToken: record.sendToken,
        targetToken: record.recvToken,
        publicClient,
        walletClient,
      });
      const o = BigInt(record.fee); // old
      const n = speedUpFee.formatted; // new

      try {
        setBusy(true);
        const receipt = await bridge?.speedUp(record, n > o ? n - o : 0n);
        notifyTransaction(receipt, record.toChain);
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
  }, [chain, record, speedUpFee, publicClient, walletClient, switchNetwork]);

  useEffect(() => {
    const sub$$ = interval(1000).subscribe(() => setCountdown((prev) => (prev > 0 ? prev - 1000 : 0)));
    return () => sub$$.unsubscribe();
  }, []);

  useEffect(() => {
    if (record?.bridge) {
      const startTime = record ? record.startTime * 1000 : Date.now();
      const minTime = (bridgeFactory({ category: record.bridge })?.getInfo().estimateTime.min || 3) * 60 * 1000;
      const token = getChainConfig(record.fromChain)?.tokens.find((t) => t.symbol === record.sendToken);
      const formatted = BigInt(record.fee);

      if (token) {
        setSpeedUpFee({ formatted, value: formatUnits(formatted, token.decimals) });
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
      <div className="gap-middle flex items-center">
        <StatusTag status={record?.result} />

        {record?.result === RecordStatus.PENDING && (
          <div className="inline text-sm font-normal text-white/50">
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

        {record?.result === RecordStatus.PENDING_TO_CLAIM && (
          <div className="gap-small flex items-center">
            <span className="text-sm font-normal text-white/50">Please claim the tokens on the target chain.</span>
            <Button className="px-1" kind="primary" busy={busy} onClick={handleClaim}>
              <span className="text-sm font-normal text-white">Claim</span>
            </Button>
          </div>
        )}

        {record?.result === RecordStatus.PENDING_TO_REFUND && (
          <div className="gap-small flex items-center">
            <span className="text-sm font-normal text-white/50">Please request refund on the source chain.</span>
            <Button className="px-1" kind="primary" busy={busy} onClick={handleRefund}>
              <span className="text-sm font-normal text-white">Refund</span>
            </Button>
          </div>
        )}

        {record?.result !== RecordStatus.PENDING && (
          <div className="gap-small flex items-center">
            <span className="text-sm font-normal text-white/50">
              You can request refund or speed up this transaction.
            </span>
            <Button className="px-1" kind="primary" busy={busy} onClick={handleRefund}>
              <span className="text-sm font-normal text-white">Refund</span>
            </Button>
            <Button className="px-1" kind="primary" onClick={() => setIsOpen(true)}>
              <span className="text-sm font-normal text-white">SpeedUp</span>
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
          placeholder="Enter new fee"
          value={speedUpFee}
          chainToken={record ? { network: record.fromChain, symbol: record.sendToken } : undefined}
          onChange={setSpeedUpFee}
        />
      </Modal>
    </>
  );
}
