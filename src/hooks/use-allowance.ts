import { useCallback, useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { from } from "rxjs";
import abi from "@/abi/erc20";
import { ChainConfig, Token } from "@/types";
import { usePublicClient, useWalletClient } from "wagmi";
import { notifyError } from "@/utils";

export function useAllowance(
  chain: ChainConfig,
  token: Token,
  owner: Address | null | undefined,
  spender: Address | null | undefined,
) {
  const [allowance, setAllowance] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const update = useCallback(() => {
    const max = BigInt(Number.MAX_SAFE_INTEGER) ** BigInt(token.decimals);

    if (token.type === "native") {
      setAllowance(max);
    } else if (owner && spender) {
      setLoading(true);
      const publicClient = createPublicClient({ chain, transport: http() });
      return from(
        publicClient.readContract({ address: token.address, abi, functionName: "allowance", args: [owner, spender] }),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setAllowance(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setAllowance(0n);
        },
      });
    } else {
      setAllowance(0n);
    }
  }, [chain, owner, spender, token.address, token.decimals, token.type]);

  const approve = useCallback(
    async (amount: bigint) => {
      if (owner && spender && walletClient) {
        setBusy(true);
        try {
          const hash = await walletClient.writeContract({
            address: token.address,
            abi,
            functionName: "approve",
            args: [spender, amount],
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === "success") {
            setAllowance(
              await publicClient.readContract({
                address: token.address,
                abi,
                functionName: "allowance",
                args: [owner, spender],
              }),
            );
          }
          setBusy(false);
          return receipt;
        } catch (err) {
          console.error(err);
          notifyError(err);
          setBusy(false);
        }
      }
    },
    [owner, spender, token.address, publicClient, walletClient],
  );

  useEffect(() => {
    const sub$$ = update();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [update]);

  return { loading, busy, allowance, refresh: update, approve };
}
