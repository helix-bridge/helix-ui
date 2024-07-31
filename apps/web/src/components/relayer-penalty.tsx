import { LnBridgeV3 } from "../bridges";
import { LnBridgeRelayerOverview, Token } from "../types";
import Tooltip from "../ui/tooltip";
import { formatBalance, getChainConfig } from "../utils";
import { useEffect, useState } from "react";
import { from } from "rxjs";

interface Props {
  record: LnBridgeRelayerOverview;
}

export default function RelayerPenalty({ record }: Props) {
  const [penalty, setPenalty] = useState<{ token: Token; value: bigint } | null>();

  useEffect(() => {
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
    const bridge = new LnBridgeV3({
      category: "lnbridge",
      sourceChain,
      targetChain,
      sourceToken,
      targetToken,
      protocol: "lnv3",
    });

    const sub$$ = from(bridge.getPenaltyReserves(record.relayer)).subscribe({
      next: setPenalty,
      error: (err) => {
        console.error(err);
        setPenalty(null);
      },
    });

    return () => {
      sub$$.unsubscribe();
    };
  }, [record]);

  return penalty ? (
    <Tooltip content={formatBalance(penalty.value, penalty.token.decimals)} className="w-fit max-w-full truncate">
      {formatBalance(penalty.value, penalty.token.decimals)}
    </Tooltip>
  ) : (
    <span>-</span>
  );
}
