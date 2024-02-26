import { LnBridgeRelayerOverview, Token } from "@/types";
import { bridgeFactory, formatBalance, getChainConfig } from "@/utils";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";

interface Props {
  record: LnBridgeRelayerOverview;
}

export default function RelayerAllowance({ record }: Props) {
  const [allowance, setAllowance] = useState<{ token: Token; value: bigint } | null>();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    const sourceChain = getChainConfig(record.fromChain);
    const targetChain = getChainConfig(record.toChain);
    const sourceToken = sourceChain?.tokens.find(
      (token) => token.address.toLowerCase() === record.sendToken?.toLowerCase(),
    );
    const targetToken = targetChain?.tokens.find(
      (token) =>
        token.symbol ===
        sourceToken?.cross.find(
          (c) =>
            (c.bridge.category === record.bridge ||
              (c.bridge.category === "lnbridge" && record.bridge.startsWith("ln"))) &&
            c.target.network === record.toChain,
        )?.target.symbol,
    );
    const bridge = bridgeFactory({ category: record.bridge, sourceChain, targetChain, sourceToken, targetToken });

    if (bridge) {
      sub$$ = from(bridge.getTargetAllowance(record.relayer)).subscribe({
        next: (res) => {
          setAllowance(res);
        },
        error: (err) => {
          console.error(err);
          setAllowance(null);
        },
      });
    } else {
      setAllowance(null);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [record]);

  return <span className="truncate">{allowance ? formatBalance(allowance.value, allowance.token.decimals) : "-"}</span>;
}
