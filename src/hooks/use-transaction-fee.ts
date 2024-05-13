import { BaseBridge } from "../bridges";
import { SortedLnBridgeRelayInfosResData, Token } from "../types";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { from } from "rxjs";

export function useTransactionFee(
  bridge: BaseBridge | undefined,
  sender: Address | undefined,
  recipient: Address | undefined,
  amount: bigint,
  relayData: SortedLnBridgeRelayInfosResData | undefined,
) {
  const [fee, setFee] = useState<{ token: Token; value: bigint } | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const relayInfo = relayData?.sortedLnBridgeRelayInfos?.records.at(0);

    setLoading(true);
    const sub$$ = from(
      bridge?.getFee({
        sender,
        recipient,
        transferAmount: amount,
        relayer: relayInfo?.relayer,
        baseFee: relayInfo?.baseFee ? BigInt(relayInfo.baseFee) : undefined,
        protocolFee: relayInfo?.protocolFee ? BigInt(relayInfo.protocolFee) : undefined,
        liquidityFeeRate: relayInfo?.liquidityFeeRate ? BigInt(relayInfo.liquidityFeeRate) : undefined,
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
  }, [bridge, amount, sender, recipient, relayData?.sortedLnBridgeRelayInfos?.records]);

  return { loading, fee };
}
