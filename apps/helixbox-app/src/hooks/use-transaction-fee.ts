import { BaseBridge } from "../bridges";
import { Token } from "../types";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { from } from "rxjs";
import { SortedRelayersQuery } from "../_generated_/gql/graphql";

export function useTransactionFee(
  bridge: BaseBridge | undefined,
  sender: Address | undefined,
  recipient: Address | undefined,
  amount: bigint,
  sortedRelayers: SortedRelayersQuery["sortedLnBridgeRelayInfos"],
) {
  const [fee, setFee] = useState<{ token: Token; value: bigint } | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sortedRelayer = sortedRelayers?.records?.at(0);

    setLoading(true);
    const sub$$ = from(
      bridge?.getFee({
        sender,
        recipient,
        transferAmount: amount,
        relayer: sortedRelayer?.relayer as Address | undefined,
        baseFee: sortedRelayer?.baseFee ? BigInt(sortedRelayer.baseFee) : undefined,
        protocolFee: sortedRelayer?.protocolFee ? BigInt(sortedRelayer.protocolFee) : undefined,
        liquidityFeeRate: sortedRelayer?.liquidityFeeRate ? BigInt(sortedRelayer.liquidityFeeRate) : undefined,
      }) || Promise.resolve(undefined),
    ).subscribe({
      next: (res) => {
        setLoading(false);
        setFee(res);
      },
      error: (err) => {
        console.error(err);
        setLoading(false);
        setFee(null);
      },
    });

    return () => {
      sub$$.unsubscribe();
    };
  }, [bridge, amount, sender, recipient, sortedRelayers?.records]);

  return { loading, fee };
}
