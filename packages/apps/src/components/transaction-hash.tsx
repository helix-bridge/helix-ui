import CopyIcon from "@/ui/copy-icon";
import { getChainConfig } from "@/utils";
import { Network } from "helix.js";
import path from "path";

interface Props {
  chain?: Network | null;
  txHash?: string | null;
}

export function TransactionHash({ chain, txHash }: Props) {
  const chainConfig = getChainConfig(chain);

  return txHash ? (
    <div className="gap-middle flex items-center">
      {chainConfig?.blockExplorers ? (
        <a
          className="text-primary text-sm font-normal transition hover:underline"
          href={path.join(chainConfig.blockExplorers.default.url, "tx", txHash)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {txHash}
        </a>
      ) : (
        <span className="text-sm font-normal text-white">{txHash}</span>
      )}
      <CopyIcon text={txHash} />
    </div>
  ) : (
    <span className="text-sm font-normal text-white">Waiting for the transaction...</span>
  );
}
