import { useCallback, useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { from, EMPTY } from "rxjs";
import abi from "@/abi/erc20";
import { ChainConfig, Token } from "@/types";

export function useAllowance(
  chain: ChainConfig | null | undefined,
  token: Token | null | undefined,
  owner: Address | null | undefined,
  spender: Address | null | undefined,
) {
  const [allowance, setAllowance] = useState(0n);
  const [loading, setLoading] = useState(false);

  const updateAllowance = useCallback(() => {
    if (chain && token && owner && spender) {
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

    return EMPTY.subscribe();
  }, [chain, token, owner, spender]);

  useEffect(() => {
    const sub$$ = updateAllowance();
    return () => {
      sub$$.unsubscribe();
    };
  }, [updateAllowance]);

  return { loading, allowance, updateAllowance };
}
