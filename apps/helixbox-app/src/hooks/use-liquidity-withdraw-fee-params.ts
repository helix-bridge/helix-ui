import { useEffect, useState } from "react";
import { useRelayerV3 } from ".";
import { MessageChannel, Token } from "../types";
import { Address, Hex } from "viem";
import { Subscription, from } from "rxjs";
import { extractTransferIds } from "../utils";

export function useLiquidityWithdrawFeeParams(
  ids: { id: string }[],
  relayer: Address | null | undefined,
  messageChannel: MessageChannel | null | undefined,
) {
  const [feeAndParams, setFeeAndParams] = useState<{ value: bigint; token: Token; params: Hex | undefined }>();
  const [loading, setLoading] = useState(false);

  const { bridgeInstance } = useRelayerV3();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (ids.length && relayer && messageChannel) {
      setLoading(true);
      sub$$ = from(
        bridgeInstance.getWithdrawLiquidityFeeAndParams(
          relayer,
          extractTransferIds(ids.map(({ id }) => id)),
          messageChannel,
        ),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setFeeAndParams(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setFeeAndParams(undefined);
        },
      });
    } else {
      setLoading(false);
      setFeeAndParams(undefined);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [ids, relayer, messageChannel, bridgeInstance]);

  return { feeAndParams, loading };
}
