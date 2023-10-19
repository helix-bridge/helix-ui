import { Token } from "@/types/token";
import Input from "@/ui/input";
import { formatBalance } from "@/utils/balance";
import { useEffect, useRef, useState } from "react";
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
  dynamic,
  value,
  token,
  onChange = () => undefined,
}: {
  placeholder?: string;
  balance?: bigint;
  limit?: bigint;
  disabled?: boolean;
  suffix?: boolean;
  dynamic?: boolean;
  value?: BalanceInputValue;
  token?: Token;
  onChange?: (value: BalanceInputValue) => void;
}) {
  const tokenRef = useRef(token);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dynamicStyle, setDynamicStyle] = useState("text-sm font-normal");

  const insufficient = balance !== undefined && (value?.formatted || 0n) > balance ? true : false;
  const exceeded = limit !== undefined && (value?.formatted || 0n) > limit ? true : false;

  useEffect(() => {
    if (dynamic) {
      const inputWidth = inputRef.current?.clientWidth || 1;
      const spanWidth = spanRef.current?.clientWidth || 0;
      const percent = (spanWidth / inputWidth) * 100;
      if (percent < 10) {
        setDynamicStyle("text-[3.75rem] font-extralight");
      } else if (percent < 20) {
        setDynamicStyle("text-[3rem] font-extralight");
      } else if (percent < 30) {
        setDynamicStyle("text-[2.25rem] font-extralight");
      } else if (percent < 40) {
        setDynamicStyle("text-[1.875rem] font-light");
      } else if (percent < 50) {
        setDynamicStyle("text-[1.5rem] font-light");
      } else if (percent < 60) {
        setDynamicStyle("text-[1.25rem] font-light");
      } else if (percent < 70) {
        setDynamicStyle("text-[1.125rem] font-normal");
      } else if (percent < 80) {
        setDynamicStyle("text-[1rem] font-normal");
      } else if (percent < 90) {
        setDynamicStyle("text-[0.875rem] font-medium");
      } else {
        setDynamicStyle("text-[0.75rem] font-medium");
      }
    }
  }, [value, dynamic]);

  useEffect(() => {
    if (!tokenRef.current && token) {
      onChange({ value: value?.value || "", formatted: parseUnits(value?.value || "0", token?.decimals || 0) });
    }
    tokenRef.current = token;
  }, [value, token, onChange]);

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
        className={`h-12 w-full rounded bg-transparent text-white transition-[font-size,font-weight,line-height] duration-300 ${
          dynamic && value?.value ? `leading-none ${dynamicStyle}` : "text-sm font-normal"
        }`}
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value))) {
              onChange({ value: e.target.value, formatted: parseUnits(e.target.value, token?.decimals || 0) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0n });
          }
        }}
        ref={inputRef}
        disabled={disabled}
        value={value?.value}
      />

      {!!(token && suffix) && <span className="text-sm">{token.symbol}</span>}

      {insufficient && <Message text="* Insufficient" />}
      {exceeded && <Message text="* Limit exceeded" />}

      <span className="invisible fixed left-0 top-0 -z-50" ref={spanRef}>
        {value?.value}
      </span>
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
