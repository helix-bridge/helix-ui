import { BaseBridge } from "@/bridges/base";
import { ChainToken } from "@/types/misc";
import { ButtonHTMLAttributes, useState } from "react";
import { TransferValue } from "./transfer-input";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getChainConfig } from "@/utils/chain";
import { notification } from "@/ui/notification";

export default function TransferAction({
  fee,
  allowance,
  bridge,
  sourceValue,
  targetValue,
  transferValue,
  onAllowanceChange,
  onTransfer,
}: {
  fee: bigint;
  allowance: bigint;
  bridge?: BaseBridge | null;
  sourceValue?: ChainToken;
  targetValue?: ChainToken;
  transferValue: TransferValue;
  onAllowanceChange: (value: bigint) => void;
  onTransfer: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const sourceChain = getChainConfig(sourceValue?.network);

  const handleApprove = async () => {
    if (bridge && address) {
      try {
        setBusy(true);
        const receipt = await bridge.approve(transferValue.formatted + fee, address);
        const href = new URL(`tx/${receipt?.transactionHash}`, sourceChain?.blockExplorers?.default.url).href;

        if (receipt?.status === "success") {
          notification.success({
            title: "Approved successfully",
            description: (
              <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
                {receipt.transactionHash}
              </a>
            ),
          });

          const allowance = await bridge.getAllowance(address);
          onAllowanceChange(allowance);
        } else if (receipt?.status === "reverted") {
          notification.warn({
            title: "Approved failed",
            description: (
              <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
                {receipt.transactionHash}
              </a>
            ),
          });
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Approved failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  };

  if (chain) {
    if (sourceChain && sourceChain.id !== chain.id) {
      return <Button onClick={() => switchNetwork && switchNetwork(sourceChain.id)}>Switch Network</Button>;
    } else if (transferValue.formatted + fee > allowance) {
      return (
        <Button onClick={handleApprove} busy={busy}>
          Approve
        </Button>
      );
    } else {
      return (
        <Button disabled={!(sourceValue && targetValue && bridge && transferValue.formatted > 0)} onClick={onTransfer}>
          Transfer
        </Button>
      );
    }
  } else {
    return <Button onClick={openConnectModal}>Connect Wallet</Button>;
  }
}

function Button({ children, busy, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      className={`bg-primary relative inline-flex h-10 shrink-0 items-center justify-center rounded transition disabled:translate-y-0 disabled:cursor-not-allowed ${
        busy ? "" : "hover:opacity-80 active:translate-y-1 disabled:opacity-60"
      }`}
      disabled={disabled || busy}
      {...rest}
    >
      {busy && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-b-white/50 border-l-white/50 border-r-white border-t-white" />
        </div>
      )}
      <span className="text-sm font-medium text-white">{children}</span>
    </button>
  );
}
