"use client";

import { getChainConfigs } from "@/utils";
import { useEffect, useState } from "react";
import { Address, createPublicClient, getContract, http } from "viem";
import { Subscription, combineLatest, forkJoin, map, of } from "rxjs";
import abi from "@/abi/erc20";
import { ChainConfig, Token } from "@/types";

const chains = getChainConfigs();

interface BalanceState {
  chain: Omit<ChainConfig, "tokens">;
  token: Token;
  balance: bigint;
}

export function useBalances(address: Address | null | undefined, enabled: boolean) {
  const [balances, setBalances] = useState<BalanceState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && enabled) {
      setLoading(true);

      const chainObs = chains.map(({ tokens, ...chain }) => {
        const publicClient = createPublicClient({ chain, batch: { multicall: true }, transport: http() });

        const balancesObs = tokens.map((token) => {
          if (token.type === "native") {
            return publicClient.getBalance({ address });
          } else {
            const contract = getContract({ address: token.address, abi, publicClient });
            return contract.read.balanceOf([address]);
          }
        });
        return balancesObs.length
          ? forkJoin(balancesObs).pipe(
              map((_balances) => _balances.map((balance, index) => ({ chain, token: tokens[index], balance }))),
            )
          : of([]);
      });

      sub$$ = combineLatest(chainObs).subscribe({
        next: (res) => {
          setBalances(res.reduce((acc, cur) => acc.concat(cur), [] as BalanceState[]));
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setBalances([]);
        },
        complete: () => {
          setLoading(false);
        },
      });
    } else {
      setBalances([]);
    }

    return () => sub$$?.unsubscribe();
  }, [address, enabled]);

  return { loading, balances };
}
