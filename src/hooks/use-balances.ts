"use client";

import { getChainConfigs } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Address, createPublicClient, getContract, http } from "viem";
import { forkJoin, map, of, merge, mergeAll, EMPTY } from "rxjs";
import abi from "@/abi/erc20";
import { ChainConfig, Token } from "@/types";

const chains = getChainConfigs();

interface BalanceState {
  chain: ChainConfig;
  token: Token;
  balance: bigint;
}

export function useBalances(address: Address | null | undefined) {
  const [balances, setBalances] = useState<BalanceState[]>([]);
  const [loading, setLoading] = useState(false);

  const updateBalances = useCallback(() => {
    if (address) {
      setBalances((prev) => (prev.length ? [] : prev));
      setLoading(true);

      const chainObs = chains.map((chain) => {
        const publicClient = createPublicClient({ chain, batch: { multicall: true }, transport: http() });

        const balancesObs = chain.tokens.map((token) => {
          if (token.type === "native") {
            return publicClient.getBalance({ address });
          } else {
            const contract = getContract({ address: token.address, abi, publicClient });
            return contract.read.balanceOf([address]);
          }
        });
        return balancesObs.length
          ? forkJoin(balancesObs).pipe(
              map((_balances) => _balances.map((balance, index) => ({ chain, token: chain.tokens[index], balance }))),
            )
          : of([]);
      });

      return merge(chainObs, 3)
        .pipe(mergeAll())
        .subscribe({
          next: (res) => {
            setBalances((prev) =>
              res.reduce(
                (acc, cur) => acc.concat(cur).sort((a, b) => a.token.symbol.localeCompare(b.token.symbol)),
                prev,
              ),
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

    return EMPTY.subscribe();
  }, [address]);

  useEffect(() => {
    const sub$$ = updateBalances();
    return () => sub$$.unsubscribe();
  }, [updateBalances]);

  return { loading, balances, updateBalances };
}
