import { getChainConfig } from "@/utils/chain";
import TokenSelect from "./token-select";
import { parseUnits } from "viem";
import { ChainToken, ChainTokens } from "@/types/cross-chain";
import { formatBalance } from "@/utils/balance";
import { useState } from "react";

interface Props {
  items: ChainTokens[];
  balance?: bigint;
  value?: ChainToken;
  isTarget?: boolean;
  onAmountChange?: (value: bigint) => void;
  onTokenChange?: (value: ChainToken) => void;
}

export default function TransferInput({
  items,
  balance,
  value,
  isTarget,
  onAmountChange = () => undefined,
  onTokenChange = () => undefined,
}: Props) {
  const [amount, setAmount] = useState(0n);
  const token = getChainConfig(value?.network)?.tokens.find(({ symbol }) => value?.symbol === symbol);

  const isInsufficient = !!(balance && amount > balance);

  return (
    <div
      className={`p-small lg:p-middle gap-small flex items-center justify-between rounded border transition-colors ${
        isTarget
          ? "bg-app-bg/60 border-transparent"
          : `bg-app-bg focus-within:border-line ${
              isInsufficient ? "border-app-red hover:border-app-red" : "hover:border-line border-transparent"
            }`
      }`}
    >
      <input
        placeholder={
          isTarget
            ? undefined
            : balance && token
            ? `Balance ${formatBalance(balance, token.decimals, { keepZero: false })}`
            : "Enter an amount"
        }
        disabled={isTarget}
        className="px-small h-12 w-full rounded bg-transparent text-base font-thin focus-visible:outline-none disabled:cursor-not-allowed"
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value)) && token) {
              const a = parseUnits(e.target.value, token.decimals);
              onAmountChange(a);
              setAmount(a);
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
