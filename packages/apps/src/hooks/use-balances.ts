"use client";

import { getChainConfigs } from "@/utils";
import { useEffect, useState } from "react";
import { Address, createPublicClient, getContract, http } from "viem";
import { Subscription, forkJoin, map, of, merge, mergeAll } from "rxjs";
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
      setBalances((prev) => (prev.length ? [] : prev));
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

      sub$$ = merge(chainObs, 3)
        .pipe(mergeAll())
        .subscribe({
          next: (res) => {
            setBalances((prev) =>
              res.reduce((acc, cur) => acc.concat(cur).sort((a, b) => a.chain.name.localeCompare(b.chain.name)), prev),
            );
          },
          error: (err) => {
            console.error(err);
            setLoading(false);
            setBalances((prev) => (prev.length ? [] : prev));
          },
          complete: () => {
            setLoading(false);
          },
        });
    } else {
      setBalances((prev) => (prev.length ? [] : prev));
    }

    return () => sub$$?.unsubscribe();
  }, [address, enabled]);

  return { loading, balances };
}
