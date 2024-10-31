import { LnBridgeRelayerOverview, Token } from "../types";
import Tooltip from "../ui/tooltip";
import { bridgeFactory, formatBalance, getChainConfig } from "../utils";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";

interface Props {
  record: LnBridgeRelayerOverview;
}

export default function RelayerBalance({ record }: Props) {
  const [balance, setBalance] = useState<{ value: bigint; token: Token } | null>();

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
      sub$$ = from(bridge.getTargetBalance(record.relayer)).subscribe({
        next: setBalance,
        error: (err) => {
          console.error(err);
          setBalance(null);
        },
      });
    } else {
      setBalance(null);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [record]);

  return balance ? (
    <Tooltip content={formatBalance(balance.value, balance.token.decimals)} className="w-fit max-w-full truncate">
      {formatBalance(balance.value, balance.token.decimals)}
    </Tooltip>
  ) : (
    <span>-</span>
  );
}
