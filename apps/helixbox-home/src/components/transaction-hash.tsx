import { Network } from "../types/chain";
import CopyIcon from "../ui/copy-icon";
import { getChainConfig } from "../utils/chain";

interface Props {
  chain?: Network | null;
  txHash?: string | null;
}

export function TransactionHash({ chain, txHash }: Props) {
  const chainConfig = getChainConfig(chain);

  return txHash ? (
    <div className="gap-medium flex items-center">
      {chainConfig?.blockExplorers ? (
        <a
          className="text-primary text-sm font-medium transition hover:underline"
          href={new URL(`tx/${txHash}`, chainConfig.blockExplorers.default.url).href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {txHash}
        </a>
      ) : (
        <span className="text-sm font-medium text-white">{txHash}</span>
      )}
      <CopyIcon text={txHash} />
    </div>
  ) : (
    <span className="text-sm font-medium text-white">Waiting for the transaction...</span>
  );
}
