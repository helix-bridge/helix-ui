import { BaseBridge } from "@/bridges/base";
import { RelayerInfo } from "@/types/graphql";
import { Token } from "@/types/token";
import CountLoading from "@/ui/count-loading";
import { formatBalance } from "@/utils/balance";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";

interface Props {
  amount: bigint;
  token?: Token | null;
  bridge?: BaseBridge | null;
  relayer?: RelayerInfo | null;
}

export default function CrossChainInfo({ amount, token, bridge, relayer }: Props) {
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState(0n);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (bridge && relayer) {
      setLoading(true);

      from(bridge.getFee(BigInt(relayer.baseFee || 0), BigInt(relayer.liquidityFeeRate || 0), amount)).subscribe({
        next: (res) => {
          setFee(res || 0n);
        },
        error: (err) => {
          console.error(err);
          setFee(0n);
        },
        complete: () => {
          setLoading(false);
        },
      });
    }

    return () => sub$$?.unsubscribe();
  }, [amount, bridge, relayer]);

  return (
    <div className="bg-app-bg p-middle gap-small flex flex-col rounded border border-transparent">
      <div className="flex items-center justify-between text-sm font-medium text-white">
        <span>Bridge</span>
        <span>{bridge?.getName() || "-"}</span>
      </div>
      <div className="flex items-center justify-between text-sm font-medium text-white">
        <span>Estimated Arrival Time</span>
        <span>{bridge?.getEstimateTime() || "-"}</span>
      </div>
      <div className="flex items-center justify-between text-sm font-medium text-white">
        <span>Transaction Fee</span>
        {loading ? (
          <CountLoading />
        ) : token ? (
          <span>
            {formatBalance(fee, token.decimals, { keepZero: false })} {token.symbol}
          </span>
        ) : (
          <span>-</span>
        )}
      </div>
    </div>
  );
}
