import { BaseBridge } from "../bridges";
import { Token } from "../types";
import { useEffect, useState } from "react";
import { from } from "rxjs";

export function useDailyLimit(bridge: BaseBridge | undefined) {
  const [loading, setLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<{ limit: bigint; token: Token } | null>();

  useEffect(() => {
    setLoading(true);
    const sub$$ = from(bridge?.getDailyLimit() || Promise.resolve(undefined)).subscribe({
      next: (res) => {
        setLoading(false);
        setDailyLimit(res);
      },
      error: (err) => {
        console.error(err);
        setLoading(false);
        setDailyLimit(null);
      },
    });
    return () => {
      sub$$.unsubscribe();
    };
  }, [bridge]);

  return { loading, dailyLimit };
}
