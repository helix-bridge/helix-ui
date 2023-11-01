import { Token } from "@/types/token";
import Input from "@/ui/input";
import { formatBalance } from "@/utils/balance";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";

interface Value {
  formatted: bigint;
  value: string;
}

interface Props {
  placeholder?: string;
  availableTips?: string;
  balance?: bigint;
  max?: bigint;
  disabled?: boolean;
  suffix?: "symbol" | "max";
  dynamic?: boolean;
  value?: Value;
  token?: Token;
  onChange?: (value: Value) => void;
}

export function BalanceInput({
  placeholder,
  balance,
  max,
  availableTips = "Max",
  disabled,
  suffix,
  dynamic,
  value,
  token,
  onChange = () => undefined,
}: Props) {
  const tokenRef = useRef(token);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [enablingMax, setEnablingMax] = useState(false);
  const [dynamicStyle, setDynamicStyle] = useState("text-sm font-normal");

  const insufficient = balance !== undefined && balance < (value?.formatted || 0n) ? true : false;
  const exceeded = max !== undefined && max < (value?.formatted || 0n) ? true : false;

  const _placeholder = useMemo(() => {
    if (balance !== undefined && token) {
      return `Balance ${formatBalance(balance, token.decimals)}`;
    }
    return placeholder ?? "Enter an amount";
  }, [balance, placeholder, token]);

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
        setDynamicStyle("text-[2.25rem] font-light");
      } else if (percent < 40) {
        setDynamicStyle("text-[1.875rem] font-light");
      } else if (percent < 50) {
        setDynamicStyle("text-[1.5rem] font-normal");
      } else if (percent < 60) {
        setDynamicStyle("text-[1.25rem] font-normal");
      } else {
        setDynamicStyle("text-[1.125rem] font-medium");
      }
    }
  }, [value, dynamic]);

  useEffect(() => {
    // Fire onChange to update `formatted`
    if (tokenRef.current?.decimals !== token?.decimals) {
      onChange(parseValue(value?.value || "", token?.decimals || 0));
    }
    tokenRef.current = token;
  }, [value, token, onChange]);

  useEffect(() => {
    if (enablingMax && exceeded) {
      const decimals = token?.decimals ?? 0;
      const origin = formatUnits(max ?? 0n, decimals);
      onChange(parseValue(origin, decimals));
    }
  }, [token?.decimals, max, onChange, enablingMax, exceeded]);

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
        placeholder={_placeholder}
        className={`h-12 w-full rounded bg-transparent text-white transition-[font-size,font-weight,line-height] duration-300 ${
          dynamic && value?.value ? `leading-none ${dynamicStyle}` : "text-sm font-normal"
        }`}
        onChange={(e) => {
          setEnablingMax(false);
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value)) && token) {
              onChange(parseValue(e.target.value, token.decimals));
            }
          } else {
            onChange({ value: e.target.value, formatted: 0n });
          }
        }}
        ref={inputRef}
        disabled={disabled}
        value={value?.value}
      />

      {!!(token && suffix === "symbol") && <span className="text-sm">{token.symbol}</span>}
      {suffix === "max" && (
        <button
          className="inline-flex items-center rounded bg-transparent px-1 transition-[transform,color] hover:scale-105 hover:bg-white/10 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            const decimals = token?.decimals ?? 0;
            const origin = formatUnits(max ?? 0n, decimals);
            onChange(parseValue(origin, decimals));
            setEnablingMax(true);
          }}
          disabled={max === undefined || token?.decimals === undefined}
        >
          <span className="text-sm">Max</span>
        </button>
      )}

      {exceeded ? (
        <Message text={`* ${availableTips}: ${formatBalance(max || 0n, token?.decimals || 0, { precision: 6 })}`} />
      ) : insufficient ? (
        <Message text="* insufficient" />
      ) : null}

      <span className="invisible fixed left-0 top-0 -z-50" ref={spanRef}>
        {value?.value}
      </span>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="absolute -bottom-5 left-0 inline-flex w-full">
      <span className="text-app-red text-xs font-light lowercase">{text}</span>
    </div>
  );
}

function parseValue(origin: string, decimals: number) {
  let value = "";
  let formatted = 0n;
  const [i, d] = origin.split(".").concat("-1");
  if (i) {
    value = d === "-1" ? i : d ? `${i}.${d.slice(0, decimals)}` : `${i}.`;
    formatted = parseUnits(value, decimals);
  }
  return { value, formatted };
}
