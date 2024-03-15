import { useTransfer } from "@/hooks";
import { InputValue } from "@/types";
import BaseButton from "@/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

interface Props {
  forceDisabled?: boolean;
  recipient: Address | undefined;
  transferable: bigint | undefined;
  transferAmount: InputValue<bigint>;
  onTransfer: () => void;
}

export default function TransferAction({ recipient, transferable, transferAmount, forceDisabled, onTransfer }: Props) {
  const {
    sourceAllowance,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    bridgeInstance,
    bridgeFee,
    sourceApprove,
  } = useTransfer();
  const [busy, setBusy] = useState(false);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const { btnText, btnDisabled, approveAmount } = useMemo(() => {
    let btnDisabled = false;
    let btnText: "Transfer" | "Approve" | "Switch Network" | "Connect Wallet" = "Transfer";
    const feeValue = bridgeFee ? (bridgeFee.token.type === "native" ? 0n : bridgeFee.value) : 0n;
    const transferValue = sourceToken?.type === "native" ? 0n : transferAmount.value;
    const approveAmount = feeValue + transferValue;

    if (chain) {
      if (chain.id !== sourceChain?.id) {
        btnText = "Switch Network";
      } else if ((sourceAllowance?.value ?? 0n) < approveAmount) {
        btnText = "Approve";
      } else if (
        !(
          sourceChain &&
          targetChain &&
          sourceToken &&
          targetToken &&
          bridgeInstance &&
          (bridgeInstance.getCategory().startsWith("xtoken") || bridgeFee) &&
          transferable &&
          transferAmount.input &&
          transferAmount.valid &&
          transferAmount.value < transferable &&
          isAddress(recipient ?? "")
        )
      ) {
        btnDisabled = true;
      }
    } else {
      btnText = "Connect Wallet";
    }
    return { btnText, btnDisabled, approveAmount };
  }, [
    chain,
    recipient,
    transferable,
    bridgeFee,
    bridgeInstance,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceAllowance,
    transferAmount,
  ]);

  const handleClick = useCallback(async () => {
    if (btnText === "Connect Wallet") {
      openConnectModal?.();
    } else if (btnText === "Switch Network") {
      switchNetwork?.(sourceChain?.id);
    } else if (btnText === "Approve") {
      if (address && sourceChain && bridgeInstance) {
        setBusy(true);
        await sourceApprove(address, approveAmount, bridgeInstance, sourceChain);
        setBusy(false);
      }
    } else if (btnText === "Transfer") {
      onTransfer();
    }
  }, [
    address,
    btnText,
    approveAmount,
    sourceChain,
    bridgeInstance,
    onTransfer,
    sourceApprove,
    switchNetwork,
    openConnectModal,
  ]);

  return (
    <Button busy={busy} disabled={btnDisabled || forceDisabled} onClick={handleClick}>
      {btnText}
    </Button>
  );
}

function Button({
  busy,
  disabled,
  children,
  onClick,
}: PropsWithChildren<{ busy?: boolean; disabled?: boolean; onClick?: () => void }>) {
  return (
    <BaseButton
      kind="primary"
      busy={busy}
      disabled={disabled}
      className="flex h-10 items-center justify-center rounded-middle"
      onClick={onClick}
    >
      <span className="text-base font-medium text-white">{children}</span>
    </BaseButton>
  );
}
