import { useCallback, useState } from "react";
import { TransferValue } from "./transfer-input";
import { Address, useNetwork, useSwitchNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Button from "@/ui/button";
import { useTransfer } from "@/hooks/use-transfer";
import { isAddress } from "viem";

interface Props {
  recipient: Address | undefined;
  transferable: bigint | undefined;
  transferValue: TransferValue;
  onTransfer: () => void;
}

export default function TransferAction({ recipient, transferable, transferValue, onTransfer }: Props) {
  const { sourceAllowance, sourceValue, targetValue, bridgeClient, fee, approve } = useTransfer();
  const [busy, setBusy] = useState(false);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const handleApprove = useCallback(async () => {
    setBusy(true);
    await approve();
    setBusy(false);
  }, [approve]);

  if (chain) {
    const feeValue = fee?.token.type === "native" ? 0n : fee?.value || 0n;

    if (sourceValue?.chain.id !== chain.id) {
      return (
        <Button kind="primary" onClick={() => switchNetwork && switchNetwork(sourceValue?.chain.id)} className="button">
          Switch Network
        </Button>
      );
    } else if (
      sourceValue.token.type !== "native" &&
      transferValue.formatted + feeValue > (sourceAllowance?.value || 0n)
    ) {
      return (
        <Button kind="primary" onClick={handleApprove} busy={busy} className="button">
          Approve
        </Button>
      );
    } else {
      return (
        <Button
          kind="primary"
          disabled={
            !(
              sourceValue &&
              targetValue &&
              bridgeClient &&
              fee?.value &&
              transferValue.formatted &&
              transferable !== undefined &&
              transferValue.formatted <= transferable &&
              isAddress(recipient || "")
            )
          }
          className="button"
          onClick={onTransfer}
        >
          Transfer
        </Button>
      );
    }
  } else {
    return (
      <Button kind="primary" onClick={openConnectModal} className="button">
        Connect Wallet
      </Button>
    );
  }
}
