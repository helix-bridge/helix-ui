import ChainTokenSelect from "./chain-token-select";
import { parseUnits } from "viem";
import { ChainToken, ChainTokens } from "@/types/misc";
import { formatBalance } from "@/utils/balance";
import Input from "@/ui/input";

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
      <Input
        placeholder={
          type === "target"
            ? undefined
            : balance !== undefined && chainToken
            ? `Balance ${formatBalance(balance, chainToken.token.decimals)}`
            : "Enter an amount"
        }
        disabled={type === "target"}
        className={`px-small h-12 w-full rounded bg-transparent text-white ${
          transferValue?.value ? "text-lg font-medium" : "text-base font-extralight"
        }`}
        onChange={({ target: { value } }) => {
          if (value) {
            if (!Number.isNaN(Number(value)) && chainToken) {
              const formatted = parseUnits(value, chainToken.token.decimals);
              onAmountChange({ value, formatted });
            }
          } else {
            onAmountChange({ value, formatted: 0n });
          }
        }}
        value={transferValue?.value}
      />
      {!!chainToken && (
        <ChainTokenSelect width={0} options={options} value={chainToken} onChange={onChainTokenChange} />
      )}
    </div>
  );
}
