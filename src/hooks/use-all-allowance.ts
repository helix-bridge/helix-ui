import { ChainConfig, Token } from "../types";
import { getChainConfigs } from "../utils";
import { useCallback, useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { forkJoin, of, map, merge, mergeAll, EMPTY } from "rxjs";
import abi from "../abi/erc20";

interface AllAllowance {
  chain: ChainConfig;
  token: Token;
  allowance: bigint;
}
const chains = getChainConfigs();

export function useAllAllowance(owner: Address | null | undefined, spender: Address | null | undefined) {
  const [allAllowance, setAllAllowance] = useState<AllAllowance[]>([]);
  const [loading, setLoading] = useState(false);

  const updateAllAllowance = useCallback(() => {
    if (owner && spender) {
      setAllAllowance((prev) => (prev.length ? [] : prev));
      setLoading(true);

      const chainObs = chains.map((chain) => {
        const publicClient = createPublicClient({ chain, batch: { multicall: true }, transport: http() });
        const allowanceObs = chain.tokens
          .filter((token) => token.type !== "native")
          .map((token) =>
            publicClient.readContract({
              address: token.address,
              abi,
              functionName: "allowance",
              args: [owner, spender],
            }),
          );
        return allowanceObs.length
          ? forkJoin(allowanceObs).pipe(
              map((aa) => aa.map((allowance, index) => ({ chain, token: chain.tokens[index], allowance }))),
            )
          : of([]);
      });

      return merge(chainObs, 3)
        .pipe(mergeAll())
        .subscribe({
          next: (res) => {
            setLoading(false);
            setAllAllowance((prev) =>
              res.reduce(
                (acc, cur) => acc.concat(cur).sort((a, b) => a.token.symbol.localeCompare(b.token.symbol)),
                prev,
              ),
            );
          },
          error: (err) => {
            console.error(err);
            setLoading(false);
            setAllAllowance((prev) => (prev.length ? [] : prev));
          },
        });
    } else {
      setAllAllowance((prev) => (prev.length ? [] : prev));
    }

    return EMPTY.subscribe();
  }, [owner, spender]);

  useEffect(() => {
    const sub$$ = updateAllAllowance();
    return () => {
      sub$$.unsubscribe();
    };
  }, [updateAllAllowance]);

  return { loading, allAllowance, updateAllAllowance };
}
