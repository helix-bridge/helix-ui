import { Network } from "@/types/chain";
import { Token, TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Subscription, forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import Tooltip from "@/ui/tooltip";
import Modal from "@/ui/modal";
import { formatBalance } from "@/utils/balance";
import { notification } from "@/ui/notification";
import { notifyTransaction } from "@/utils/notification";

interface Props {
  sourceChain?: Network;
  sourceToken?: TokenSymbol;
  onSuccess?: () => void;
}

export default function Faucet({ sourceChain, sourceToken, onSuccess = () => undefined }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [allow, setAllow] = useState(0n);
  const [max, setMax] = useState(0n);

  const { chainConfig, tokenConfig } = useMemo(() => {
    const chainConfig = getChainConfig(sourceChain);
    const tokenConfig = chainConfig?.tokens.find((t) => t.symbol === sourceToken);

    return { chainConfig, tokenConfig };
  }, [sourceChain, sourceToken]);

  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address } = useAccount();
  const { chain } = useNetwork();

  const handleClaim = useCallback(async () => {
    if (chain?.id !== chainConfig?.id) {
      switchNetwork?.(chainConfig?.id);
    } else if (tokenConfig && publicClient && walletClient) {
      try {
        setBusy(true);

        const abi = (await import("@/abi/faucet.json")).default;
        const hash = await walletClient.writeContract({
          address: tokenConfig.address,
          abi,
          functionName: "fault",
          args: [allow],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        notifyTransaction(receipt, chainConfig?.network);
        if (receipt.status === "success") {
          setAllow(0n);
          setBusy(false);
          setIsOpen(false);
          onSuccess();
        }
      } catch (err) {
        console.error(err);
        notification.error({ title: "Calim failed", description: (err as Error).message });
      } finally {
        setBusy(false);
      }
    }
  }, [allow, chain, chainConfig, tokenConfig, publicClient, walletClient, switchNetwork, onSuccess]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && tokenConfig && publicClient) {
      sub$$ = from(import("@/abi/faucet.json"))
        .pipe(
          switchMap((abi) =>
            forkJoin([
              from(
                publicClient.readContract({
                  address: tokenConfig.address,
                  abi: abi.default,
                  functionName: "allowFault",
                  args: [address],
                }) as Promise<bigint>,
              ),
              from(
                publicClient.readContract({
                  address: tokenConfig.address,
                  abi: abi.default,
                  functionName: "maxFaultAllowed",
                }) as Promise<bigint>,
              ),
            ]),
          ),
        )
        .subscribe({
          next: ([a, m]) => {
            setAllow(a);
            setMax(m);
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
  }, [address, tokenConfig, publicClient]);

  return (
    <>
      <Tooltip
        content={<span className="text-xs font-normal text-white">It is temporarily unavailable</span>}
        enabled={!(allow > 0)}
      >
        <button
          className="text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-white/50"
          disabled={!(allow > 0)}
          onClick={() => setIsOpen(true)}
        >
          <span className="text-sm font-normal">Faucet</span>
        </button>
      </Tooltip>

      <Modal
        className="w-full lg:w-[30rem]"
        title="Faucet"
        okText={chain?.id === chainConfig?.id ? "Claim" : "Switch Network"}
        isOpen={isOpen}
        disabledCancel={busy}
        busy={busy}
        onClose={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        onOk={handleClaim}
      >
        <Section label="Max" formated value={max} token={tokenConfig} />
        <Section label="Allow" value={allow} token={tokenConfig} />
      </Modal>
    </>
  );
}

function Section({
  label,
  value,
  formated,
  token,
}: {
  label: string;
  value: bigint;
  formated?: boolean;
  token?: Token;
}) {
  return (
    <div className="gap-middle flex flex-col">
      <span className="text-sm">{label}</span>
      <div className="px-middle bg-app-bg py-middle flex items-center justify-between rounded">
        <span className="text-sm">{token && formatBalance(value, formated ? 0 : token.decimals)}</span>
        <span className="text-sm">{token?.symbol}</span>
      </div>
    </div>
  );
}
