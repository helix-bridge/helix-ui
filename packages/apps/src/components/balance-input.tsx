import { Token } from "@/types/token";
import Input from "@/ui/input";
import { formatBalance } from "@/utils/balance";
import { parseUnits } from "viem";

export interface BalanceInputValue {
  formatted: bigint;
  value: string;
}

export function BalanceInput({
  placeholder,
  balance,
  limit,
  disabled,
  suffix,
  value,
  token,
  onChange = () => undefined,
}: {
  placeholder?: string;
  balance?: bigint;
  limit?: bigint;
  disabled?: boolean;
  suffix?: boolean;
  value?: BalanceInputValue;
  token?: Token;
  onChange?: (value: BalanceInputValue) => void;
}) {
  const insufficient = balance !== undefined && (value?.formatted || 0n) > balance ? true : false;
  const exceeded = limit !== undefined && (value?.formatted || 0n) > limit ? true : false;

  return (
    <div
      className={`lg:px-middle px-small py-small gap-small bg-app-bg normal-input-wrap relative flex items-center justify-between ${
        insufficient || exceeded
          ? "invalid-input-wrap"
          : disabled
          ? "border-transparent"
          : "valid-input-wrap border-transparent"
      }`}
    >
      <Input
        placeholder={
          balance !== undefined
            ? `Balance ${formatBalance(balance, token?.decimals || 0)}`
            : placeholder ?? "Enter an amount"
        }
        className="h-12 w-full rounded bg-transparent text-sm font-medium text-white"
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value))) {
              onChange({ value: e.target.value, formatted: parseUnits(e.target.value, token?.decimals || 0) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0n });
          }
        }}
        disabled={disabled}
        value={value?.value}
      />

      {!!(token && suffix) && <span className="text-sm">{token.symbol}</span>}

      {insufficient && <Message text="* Insufficient" />}
      {exceeded && <Message text="* Limit exceeded" />}
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="absolute -bottom-5 left-0 w-full">
      <span className="text-app-red text-xs font-light">{text}</span>
    </div>
  );
}
