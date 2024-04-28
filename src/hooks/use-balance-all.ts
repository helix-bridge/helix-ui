"use client";

import { getChainConfigs } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPublicClient, getContract, http } from "viem";
import { forkJoin, map, of, merge, mergeAll } from "rxjs";
import abi from "@/abi/erc20";
import { ChainConfig, Token } from "@/types";
import { useAccount } from "wagmi";

const chains = getChainConfigs();

interface BalanceAll {
  chain: ChainConfig;
  token: Token;
  balance: bigint;
}

export function useBalanceAll() {
  const [balanceAll, setBalanceAll] = useState<BalanceAll[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const balanceAllRef = useRef(balanceAll);

  const updateBalanceAll = useCallback(() => {
    if (address) {
      const chainsObs = chains.map((chain) => {
        const publicClient = createPublicClient({ chain, batch: { multicall: true }, transport: http() });

        const tokensObs = chain.tokens.map((token) => {
          if (token.type === "native") {
            return publicClient.getBalance({ address });
          } else {
            const contract = getContract({ address: token.address, abi, publicClient });
            return contract.read.balanceOf([address]);
          }
        });
        return tokensObs.length
          ? forkJoin(tokensObs).pipe(
              map((balances) => balances.map((balance, index) => ({ chain, token: chain.tokens[index], balance }))),
            )
          : of([]);
      });

      balanceAllRef.current = [];
      setLoading(true);

      return merge(chainsObs, 3)
        .pipe(mergeAll())
        .subscribe({
          next: (res) => {
            balanceAllRef.current = res.reduce(
              (acc, cur) => acc.concat(cur).sort((a, b) => a.token.symbol.localeCompare(b.token.symbol)),
              balanceAllRef.current,
            );
          },
          error: (err) => {
            console.error(err);
            balanceAllRef.current = [];
            setLoading(false);
          },
          complete: () => {
            setLoading(false);
          },
        });
    } else {
      balanceAllRef.current = [];
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    const sub$$ = updateBalanceAll();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [updateBalanceAll]);

  useEffect(() => {
    if (!loading) {
      setBalanceAll(balanceAllRef.current);
    }
  }, [loading]);

  return { loadingBalanceAll: loading, balanceAll, updateBalanceAll };
}
