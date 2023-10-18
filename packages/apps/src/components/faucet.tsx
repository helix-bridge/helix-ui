import { Token } from "@/types/token";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Subscription, forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import Modal from "@/ui/modal";
import { formatBalance } from "@/utils/balance";
import { notification } from "@/ui/notification";
import { notifyTransaction } from "@/utils/notification";
import Label from "@/ui/label";
import { useTransfer } from "@/hooks/use-transfer";
import { parseUnits } from "viem";

export default function Faucet() {
  const { sourceChain, sourceToken, updateBalance } = useTransfer();

  const [isOpen, setIsOpen] = useState(false);
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
    } else if (sourceToken && publicClient && walletClient) {
      try {
        setBusy(true);

        const abi = (await import("@/abi/faucet.json")).default;
        const hash = await walletClient.writeContract({
          address: sourceToken.address,
          abi,
          functionName: "faucet",
          args: [allow > 0 ? allow - 1n : allow],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        notifyTransaction(receipt, sourceChain);
        if (receipt.status === "success") {
          setAllow(0n);
          setBusy(false);
          setIsOpen(false);
          updateBalance();
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Calim failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [allow, chain, sourceChain, sourceToken, publicClient, walletClient, switchNetwork, updateBalance]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && sourceToken?.type === "erc20" && publicClient) {
      sub$$ = from(import("@/abi/faucet.json"))
        .pipe(
          switchMap((abi) =>
            forkJoin([
              from(
                publicClient.readContract({
                  address: sourceToken.address,
                  abi: abi.default,
                  functionName: "allowFaucet",
                  args: [address],
                }) as Promise<bigint>,
              ),
              from(
                publicClient.readContract({
                  address: sourceToken.address,
                  abi: abi.default,
                  functionName: "maxFaucetAllowed",
                }) as Promise<bigint>,
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
        className="text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-white/50"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm font-normal">Faucet</span>
      </button>

      <Modal
        className="w-full lg:w-[30rem]"
        title="Faucet"
        okText={chain?.id === sourceChain?.id ? "Claim" : "Switch Network"}
        isOpen={isOpen}
        disabledCancel={busy}
        disabledOk={allow <= 1n}
        busy={busy}
        onClose={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        onOk={handleClaim}
      >
        <Label text="Max" tips="The maximum you can claim">
          <Item value={max} token={sourceToken} />
        </Label>
        <Label text="Allow" tips="Currently available for claiming">
          <Item value={allow} token={sourceToken} />
        </Label>
      </Modal>
    </>
  );
}

function Item({ value, token }: { value: bigint; token?: Token }) {
  return (
    <div className="px-middle bg-app-bg py-middle flex items-center justify-between rounded">
      <span className="text-sm">{token && formatBalance(value, token.decimals)}</span>
      <span className="text-sm">{token?.symbol}</span>
    </div>
  );
}
