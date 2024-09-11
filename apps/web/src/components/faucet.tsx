import { formatBalance, getTokenLogoSrc, notifyError, notifyTransaction } from "../utils";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Subscription, forkJoin, from } from "rxjs";
import { parseUnits } from "viem";
import { ChainConfig, Token } from "../types";
import abi from "../abi/faucet";
import Tooltip from "../ui/tooltip";
import CountLoading from "../ui/count-loading";
import Modal from "../ui/modal";
import { CONFIRMATION_BLOCKS } from "../config";

interface Props {
  sourceChain: ChainConfig;
  sourceToken: Token;
  onSuccess?: () => void;
}

export default function Faucet({ sourceChain, sourceToken, onSuccess = () => undefined }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [allow, setAllow] = useState(0n);
  const [max, setMax] = useState(0n);

  const publicClient = usePublicClient({ chainId: sourceChain.id });
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const { chain } = useNetwork();

  const handleClaim = useCallback(async () => {
    if (chain?.id !== sourceChain.id) {
      switchNetwork?.(sourceChain.id);
    } else if (address && publicClient && walletClient) {
      try {
        setBusy(true);
        const hash = await walletClient.writeContract({
          address: sourceToken.address,
          abi,
          functionName: "faucet",
          args: [1n <= allow ? allow - 1n : allow],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: CONFIRMATION_BLOCKS });
        notifyTransaction(receipt, sourceChain);
        setBusy(false);

        if (receipt.status === "success") {
          setAllow(0n);
          setBusy(false);
          setIsOpen(false);
          onSuccess();
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
        setBusy(false);
      }
    }
  }, [allow, chain, address, sourceChain, sourceToken, publicClient, walletClient, onSuccess, switchNetwork]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && sourceToken.type === "erc20" && publicClient) {
      setLoading(true);
      sub$$ = forkJoin([
        from(
          publicClient.readContract({
            address: sourceToken.address,
            abi,
            functionName: "allowFaucet",
            args: [address],
          }),
        ),
        from(
          publicClient.readContract({
            address: sourceToken.address,
            abi,
            functionName: "maxFaucetAllowed",
          }),
        ),
      ]).subscribe({
        next: ([a, m]) => {
          setLoading(false);
          const _max = parseUnits(m.toString(), sourceToken.decimals);
          setAllow(_max - a);
          setMax(_max);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setAllow(0n);
          setMax(0n);
        },
      });
    } else {
      setAllow(0n);
      setMax(0n);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [address, sourceToken, publicClient]);

  return (
    <>
      <button
        className="rounded-full bg-white/20 px-2 py-[2px] text-xs font-semibold text-white opacity-60 transition-opacity hover:opacity-100 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        Faucet
      </button>

      <Modal
        className="w-full lg:w-[24rem]"
        title="Faucet"
        okText={chain?.id === sourceChain.id ? "Claim" : "Switch Network"}
        isOpen={isOpen}
        disabledCancel={busy}
        disabledOk={allow <= 1n}
        busy={busy}
        onClose={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        onOk={handleClaim}
      >
        <Label text="Max" tips="The maximum you can claim">
          <Item loading={loading} value={max} token={sourceToken} />
        </Label>
        <Label text="Allow" tips="Currently available for claiming">
          <Item loading={loading} value={allow} token={sourceToken} />
        </Label>
      </Modal>
    </>
  );
}

function Label({ text, tips, children }: PropsWithChildren<{ text: string; tips?: string }>) {
  return (
    <div className="gap-small flex flex-col">
      <div className="gap-small flex items-center">
        <span className="text-sm font-semibold text-white/50">{text}</span>
        {tips ? (
          <Tooltip content={tips}>
            <img width={16} height={16} alt="Tips" src="images/info.svg" className="h-4 w-4 shrink-0" />
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Item({ value, token, loading }: { value: bigint; token: Token; loading?: boolean }) {
  return (
    <div className="bg-background flex items-center justify-between rounded-xl px-4 py-3">
      {loading ? (
        <CountLoading size="small" color="white" />
      ) : (
        <span className="text-base font-bold">
          {formatBalance(value, token.decimals, { precision: 3, keepZero: true })}
        </span>
      )}
      <div className="flex items-center gap-2">
        <img
          width={24}
          height={24}
          alt="Token"
          className="h-6 w-6 shrink-0 rounded-full"
          src={getTokenLogoSrc(token.logo)}
        />
        <span className="text-base font-bold">{token.symbol}</span>
      </div>
    </div>
  );
}
