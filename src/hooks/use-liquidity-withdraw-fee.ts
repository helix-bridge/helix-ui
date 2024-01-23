import { useEffect, useState } from "react";
import { useRelayerV3 } from ".";
import { MessageChannel, Token } from "@/types";
import { Address } from "viem";
import { Subscription, from } from "rxjs";
import { extractTransferIds } from "@/utils";

export function useLiquidityWithdrawFee(
  ids: { id: string }[],
  relayer: Address | null | undefined,
  messageChannel: MessageChannel | null | undefined,
) {
  const [fee, setFee] = useState<{ value: bigint; token: Token }>();
  const [loading, setLoading] = useState(false);

  const { bridgeInstance } = useRelayerV3();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (ids.length && relayer && messageChannel) {
      setLoading(true);
      sub$$ = from(
        bridgeInstance.getWithdrawLiquidityFee(relayer, extractTransferIds(ids.map(({ id }) => id)), messageChannel),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setFee(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setFee(undefined);
        },
      });
    } else {
      setLoading(false);
      setFee(undefined);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [ids, relayer, messageChannel, bridgeInstance]);

  return { fee, loading };
}
