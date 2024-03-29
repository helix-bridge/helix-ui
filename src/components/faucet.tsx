import { useTransfer } from "@/hooks/use-transfer";
import { formatBalance, notifyError, notifyTransaction } from "@/utils";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Subscription, forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { parseUnits } from "viem";
import Label from "@/ui/label";
import { Token } from "@/types";
import { useToggle } from "@/hooks/use-toggle";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

export default function Faucet() {
  const { sourceChain, sourceToken, bridgeInstance, updateSourceBalance } = useTransfer();

  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const [busy, setBusy] = useState(false);
  const [allow, setAllow] = useState(0n);
  const [max, setMax] = useState(0n);

  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: sourceChain?.id });
  const { address } = useAccount();
  const { chain } = useNetwork();

  const handleClaim = useCallback(async () => {
    if (chain?.id !== sourceChain?.id) {
      switchNetwork?.(sourceChain?.id);
    } else if (address && bridgeInstance && sourceToken && publicClient && walletClient) {
      try {
        setBusy(true);

        const hash = await walletClient.writeContract({
          address: sourceToken.address,
          abi: (await import("@/abi/faucet")).default,
          functionName: "faucet",
          args: [allow > 0 ? allow - 1n : allow],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        notifyTransaction(receipt, sourceChain);
        if (receipt.status === "success") {
          setAllow(0n);
          setBusy(false);
          setIsOpenFalse();
          updateSourceBalance(address, bridgeInstance);
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
      } finally {
        setBusy(false);
      }
    }
  }, [
    allow,
    chain,
    address,
    bridgeInstance,
    sourceChain,
    sourceToken,
    publicClient,
    walletClient,
    setIsOpenFalse,
    switchNetwork,
    updateSourceBalance,
  ]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && sourceToken?.type === "erc20" && publicClient) {
      sub$$ = from(import("@/abi/faucet"))
        .pipe(
          switchMap((abi) =>
            forkJoin([
              from(
                publicClient.readContract({
                  address: sourceToken.address,
                  abi: abi.default,
                  functionName: "allowFaucet",
                  args: [address],
                }),
              ),
              from(
                publicClient.readContract({
                  address: sourceToken.address,
                  abi: abi.default,
                  functionName: "maxFaucetAllowed",
                }),
              ),
            ]),
          ),
        )
        .subscribe({
          next: ([a, m]) => {
            const _max = parseUnits(m.toString(), sourceToken.decimals);
            setAllow(_max - a);
            setMax(_max);
          },
          error: (err) => {
            console.error(err);
            setAllow(0n);
            setMax(0n);
          },
        });
    } else {
      setAllow(0n);
      setMax(0n);
    }

    return () => sub$$?.unsubscribe();
  }, [address, sourceToken, publicClient]);

  return (
    <>
      <button
        className="text-primary transition-[color,transform] hover:text-white lg:active:translate-y-1"
        onClick={setIsOpenTrue}
      >
        <span className="text-sm font-medium">Faucet</span>
      </button>

      <Modal
        className="w-full lg:w-[24rem]"
        title="Faucet"
        okText={chain?.id === sourceChain?.id ? "Claim" : "Switch Network"}
        isOpen={isOpen}
        disabledCancel={busy}
        disabledOk={allow <= 1n}
        busy={busy}
        onClose={setIsOpenFalse}
        onCancel={setIsOpenFalse}
        onOk={handleClaim}
      >
        <Label text="Max" tips="The maximum you can claim" textClassName="text-sm font-medium">
          <Item value={max} token={sourceToken} />
        </Label>
        <Label text="Allow" tips="Currently available for claiming" textClassName="text-sm font-medium">
          <Item value={allow} token={sourceToken} />
        </Label>
      </Modal>
    </>
  );
}

function Item({ value, token }: { value: bigint; token?: Token }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-inner px-middle py-3">
      <span className="text-sm font-semibold">{token && formatBalance(value, token.decimals)}</span>
      <span className="text-sm font-semibold">{token?.symbol}</span>
    </div>
  );
}
