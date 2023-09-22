import { getChainConfig } from "@/utils/chain";
import TokenSelect from "./token-select";
import { parseUnits } from "viem";
import { ChainToken, ChainTokens } from "@/types/cross-chain";
import { formatBalance } from "@/utils/balance";

export interface TransferValue {
  value: string;
  formatted: bigint;
}

interface Props {
  options: ChainTokens[];
  balance?: bigint;
  chainToken?: ChainToken;
  transferValue?: TransferValue;
  type: "source" | "target";

  onAmountChange?: (value: TransferValue) => void;
  onChainTokenChange?: (value: ChainToken) => void;
}

export default function TransferInput({
  options,
  balance,
  chainToken,
  transferValue,
  type,
  onAmountChange = () => undefined,
  onChainTokenChange = () => undefined,
}: Props) {
  const token = getChainConfig(chainToken?.network)?.tokens.find(({ symbol }) => chainToken?.symbol === symbol);
  const insufficient = balance && (transferValue?.formatted || 0n) > balance ? true : false;

  return (
    <div
      className={`p-small lg:p-middle gap-small flex items-center justify-between rounded border transition-colors ${
        type === "target"
          ? "bg-app-bg/60 border-transparent"
          : `bg-app-bg ${
              insufficient
                ? "hover:border-app-red focus-within:border-app-red border-app-red"
                : "hover:border-line focus-within:border-line border-transparent"
            }`
      }`}
    >
      <input
        placeholder={
          type === "target"
            ? undefined
            : balance !== undefined && token
            ? `Balance ${formatBalance(balance, token.decimals, { keepZero: false })}`
            : "Enter an amount"
        }
        disabled={type === "target"}
        className="px-small h-12 w-full rounded bg-transparent text-base font-extralight text-white focus-visible:outline-none disabled:cursor-not-allowed"
        onChange={({ target: { value } }) => {
          if (value) {
            if (!Number.isNaN(Number(value)) && token) {
              const formatted = parseUnits(value, token.decimals);
              onAmountChange({ value, formatted });
            }
          } else {
            onAmountChange({ value, formatted: 0n });
          }
        }}
        value={transferValue?.value}
      />
      <TokenSelect options={options} value={chainToken} onChange={onChainTokenChange} />
    </div>
  );
}
