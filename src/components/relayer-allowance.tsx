import { useAllowance } from "@/hooks";
import { LnBridgeRelayerOverview } from "@/types";
import { bridgeFactory, formatBalance, getChainConfig } from "@/utils";

interface Props {
  record: LnBridgeRelayerOverview;
}

export default function RelayerAllowance({ record }: Props) {
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
  const { allowance } = useAllowance(targetChain, targetToken, record.relayer, bridge?.getContract()?.targetAddress);

  return <span className="truncate">{formatBalance(allowance, targetToken?.decimals)}</span>;
}
