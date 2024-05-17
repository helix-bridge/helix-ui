import { ChainConfig, Token } from "../types";
import { Address, createPublicClient, http } from "viem";
import { from } from "rxjs";
import { useCallback, useEffect, useState } from "react";
import abi from "../abi/erc20";

export function useBalance(chain: ChainConfig, token: Token, address?: Address | null) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0n);

  const updateBalance = useCallback(() => {
    if (address) {
      const publicClient = createPublicClient({ transport: http(), chain });
      setLoading(true);
      return from(
        token.type === "native"
          ? publicClient.getBalance({ address })
          : publicClient.readContract({ address: token.address, abi, functionName: "balanceOf", args: [address] }),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setBalance(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setBalance(0n);
        },
      });
    } else {
      setLoading(false);
      setBalance(0n);
    }
  }, [chain, token.address, token.type, address]);

  useEffect(() => {
    const sub$$ = updateBalance();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [updateBalance]);

  return { loading, balance, refresh: updateBalance };
}
