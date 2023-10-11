import { BaseBridge } from "@/bridges/base";
import { Token } from "@/types/token";
import CountLoading from "@/ui/count-loading";
import { formatBalance } from "@/utils/balance";
import { PropsWithChildren, useEffect, useState } from "react";
import { Subscription, from } from "rxjs";

interface Props {
  fee?: { value: bigint; token: Token };
  bridge?: BaseBridge | null;
  loading?: boolean;
}

export default function CrossChainInfo({ fee, bridge, loading }: Props) {
  const [isLoadingDailyLimit, setIsLoadingDailyLimit] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<{ limit: bigint; spent: bigint; token: Token }>();

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (bridge) {
      setIsLoadingDailyLimit(true);
      sub$$ = from(bridge.getDailyLimit()).subscribe({
        next: setDailyLimit,
        error: (err) => {
          console.error(err);
          setDailyLimit(undefined);
          setIsLoadingDailyLimit(false);
        },
        complete: () => setIsLoadingDailyLimit(false),
      });
    } else {
      setDailyLimit(undefined);
    }
    return () => sub$$?.unsubscribe();
  }, [bridge]);

  return (
    <div className="bg-app-bg p-middle gap-small flex flex-col rounded border border-transparent">
      <Section>
        <span>Bridge</span>
        <span>{bridge?.getInfo().name || ""}</span>
      </Section>
      <Section>
        <span>Estimated Arrival Time</span>
        <span>{bridge?.formatEstimateTime() || ""}</span>
      </Section>
      <Section>
        <span>Transaction Fee</span>
        {loading ? (
          <CountLoading color="white" />
        ) : fee ? (
          <span>
            {formatBalance(fee.value, fee.token.decimals)} {fee.token.symbol}
          </span>
        ) : (
          <span></span>
        )}
      </Section>
      {!!dailyLimit && (
        <Section>
          <span>Daily Limit</span>
          {isLoadingDailyLimit ? (
            <CountLoading color="white" />
          ) : (
            <span>
              {formatBalance(dailyLimit.limit, dailyLimit.token.decimals)} {dailyLimit.token.symbol}
            </span>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ children }: PropsWithChildren<unknown>) {
  return <div className="flex items-center justify-between text-sm font-normal text-white">{children}</div>;
}
