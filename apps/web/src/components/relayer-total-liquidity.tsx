import { useWithdrawableLiquidities } from "../hooks";
import { LnBridgeRelayerOverview, Token } from "../types";
import Tooltip from "../ui/tooltip";
import { formatBalance, getChainConfig } from "../utils";
import { useMemo } from "react";

interface Props {
  record: LnBridgeRelayerOverview;
}

export default function RelayerTotalLiquidity({ record }: Props) {
  const { relayer, sourceChain, targetChain, sourceToken, targetToken } = useMemo(() => {
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
    return { relayer: record.relayer, sourceChain, targetChain, sourceToken, targetToken };
  }, [record]);

  const { data } = useWithdrawableLiquidities(
    relayer,
    targetToken?.address,
    sourceChain?.network,
    targetChain?.network,
    240,
  );

  return sourceToken ? <DisplayLiquidity data={data} token={sourceToken} /> : <span>-</span>;
}

function DisplayLiquidity({ data, token }: { data: { sendAmount: string }[]; token: Token }) {
  const total = data.reduce((acc, cur) => acc + BigInt(cur.sendAmount), 0n);
  return (
    <Tooltip content={formatBalance(total, token.decimals)} className="w-fit max-w-full truncate">
      {formatBalance(total, token.decimals)}
    </Tooltip>
  );
}
