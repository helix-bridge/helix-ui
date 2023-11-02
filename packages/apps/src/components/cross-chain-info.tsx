import { BaseBridge } from "@/bridges/base";
import { Token } from "@/types/token";
import CountLoading from "@/ui/count-loading";
import Tooltip from "@/ui/tooltip";
import { formatBalance } from "@/utils/balance";
import Image from "next/image";
import { PropsWithChildren, useEffect, useState } from "react";
import { Subscription, from } from "rxjs";

interface Props {
  fee: { loading: boolean; value: bigint; token?: Token } | undefined;
  bridge: BaseBridge | undefined;
  maxMargin: string | undefined;
  isLoadingMaxMargin: boolean;
}

export default function CrossChainInfo({ fee, bridge, maxMargin, isLoadingMaxMargin }: Props) {
  const [transferLimit, setTransferLimit] = useState<{ token: Token; value: bigint }>();
  const [dailyLimit, setDailyLimit] = useState<{ loading: boolean; limit: bigint; spent: bigint; token: Token }>();

  useEffect(() => {
    if (!isLoadingMaxMargin) {
      const token = bridge?.getSourceToken();
      if (maxMargin && token) {
        setTransferLimit({ token, value: BigInt(maxMargin) });
      } else {
        setTransferLimit(undefined);
      }
    }
  }, [bridge, maxMargin, isLoadingMaxMargin]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (bridge) {
      setDailyLimit((prev) => (prev ? { ...prev, loading: true } : undefined));
      sub$$ = from(bridge.getDailyLimit()).subscribe({
        next: (res) => {
          setDailyLimit(res ? { ...res, loading: false } : undefined);
        },
        error: (err) => {
          console.error(err);
          setDailyLimit(undefined);
        },
      });
    } else {
      setDailyLimit(undefined);
    }
    return () => sub$$?.unsubscribe();
  }, [bridge]);

  return (
    <div className="bg-app-bg p-middle gap-small flex flex-col rounded border border-transparent">
      <Item>
        <span>Estimated Arrival Time</span>
        <span>{bridge?.formatEstimateTime()}</span>
      </Item>
      <Item>
        <span>Transaction Fee</span>
        {fee?.loading ? (
          <CountLoading color="white" />
        ) : fee?.token && fee.value ? (
          <span>
            {formatBalance(fee.value, fee.token.decimals, { precision: 6 })} {fee.token.symbol}
          </span>
        ) : (
          <Tooltip content="No relayer available, please check the transfer amount">
            <Image width={16} height={16} alt="Fee" src="/images/warning.svg" />
          </Tooltip>
        )}
      </Item>
      {!!transferLimit && (
        <Item>
          <span>Transfer Limit</span>
          <span>
            {formatBalance(transferLimit.value, transferLimit.token.decimals)} {transferLimit.token.symbol}
          </span>
        </Item>
      )}
      {!!dailyLimit && (
        <Item>
          <span>Daily Limit</span>
          {dailyLimit.loading ? (
            <CountLoading color="white" />
          ) : (
            <span>
              {formatBalance(dailyLimit.limit, dailyLimit.token.decimals)} {dailyLimit.token.symbol}
            </span>
          )}
        </Item>
      )}
    </div>
  );
}

function Item({ children }: PropsWithChildren<unknown>) {
  return <div className="flex items-center justify-between text-sm font-normal text-white">{children}</div>;
}
