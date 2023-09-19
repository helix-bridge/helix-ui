import { getChainConfig } from "@/utils/chain";
import TokenSelect from "./token-select";
import { parseUnits } from "viem";
import { ChainToken, ChainTokens } from "@/types/cross-chain";

interface Props {
  items: ChainTokens[];
  value?: ChainToken;
  isTarget?: boolean;
  onAmountChange?: (value: bigint) => void;
  onTokenChange?: (value: ChainToken) => void;
}

export default function TransferInput({
  items,
  value,
  isTarget,
  onAmountChange = () => undefined,
  onTokenChange = () => undefined,
}: Props) {
  const token = getChainConfig(value?.network)?.tokens.find(({ symbol }) => value?.symbol === symbol);

  return (
    <div
      className={`p-small lg:p-middle gap-small flex items-center justify-between rounded border border-transparent transition-colors ${
        isTarget ? "bg-app-bg/60" : "hover:border-line bg-app-bg focus-within:border-line"
      }`}
    >
      <input
        placeholder={isTarget ? undefined : "Enter an amount"}
        disabled={isTarget}
        className="px-small h-12 w-full rounded bg-transparent text-base font-thin focus-visible:outline-none disabled:cursor-not-allowed"
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value)) && token) {
              onAmountChange(parseUnits(e.target.value, token.decimals));
            }
          } else {
            onAmountChange(0n);
          }
        }}
      />
      <TokenSelect items={items} value={value} onChange={onTokenChange} />
    </div>
  );
}
