import { InputValue, Token } from "@/types";
import Input from "@/ui/input";
import InputAlert from "@/ui/input-alert";
import { formatBalance, getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { ChangeEventHandler, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";

interface Props {
  placeholder?: string;
  balance?: bigint;
  max?: bigint;
  compact?: boolean;
  disabled?: boolean;
  suffix?: "symbol" | "max";
  enabledDynamicStyle?: boolean;
  value: InputValue<bigint>;
  token: Token | undefined;
  tokenOptions?: Token[];
  balanceLoading?: boolean;
  onBalanceRefresh?: () => void;
  onChange?: (value: InputValue<bigint>) => void;
  onTokenChange?: (token: Token) => void;
}

export function BalanceInput({
  placeholder,
  balance,
  max,
  compact,
  disabled,
  suffix,
  enabledDynamicStyle,
  value,
  token,
  balanceLoading,
  tokenOptions = [],
  onBalanceRefresh = () => undefined,
  onChange = () => undefined,
  onTokenChange = () => undefined,
}: Props) {
  const tokenRef = useRef<Token>();
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const insufficientRef = useRef(false);
  const exceededRef = useRef(false);

  const [enablingMax, setEnablingMax] = useState(false);
  const [dynamicStyle, setDynamicStyle] = useState("text-sm font-medium");

  const isExceeded = useMemo(() => (typeof max === "bigint" && max < value.value ? true : false), [max, value]);

  const _placeholder = useMemo(() => {
    if (token && compact) {
      if (max !== undefined) {
        return `Max ${formatBalance(max, token.decimals)}`;
      } else if (balance !== undefined) {
        return `Balance ${formatBalance(balance, token.decimals)}`;
      }
    }
    return placeholder ?? "Enter an amount";
  }, [balance, max, placeholder, token, compact]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const input = e.target.value;
      let parsed = { value: 0n, input: "" };
      let valid = true;

      if (input) {
        if (token && !Number.isNaN(Number(input))) {
          parsed = parseValue(input, token.decimals);
          insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
          exceededRef.current = typeof max === "bigint" && max < parsed.value ? true : false;
          valid = !(insufficientRef.current || exceededRef.current);
          onChange({ valid, ...parsed });
        }
      } else {
        onChange({ valid, ...parsed });
      }

      setEnablingMax(false);
    },
    [token, max, balance, onChange],
  );

  const handleMax = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      if (typeof max === "bigint" && token) {
        const decimals = token.decimals;
        const parsed = parseValue(formatUnits(max, decimals), decimals);
        insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
        exceededRef.current = max && max < parsed.value ? true : false;
        const valid = !(insufficientRef.current || exceededRef.current);
        onChange({ valid, ...parsed });
        setEnablingMax(true);
      }
    },
    [max, token, balance, onChange],
  );

  useEffect(() => {
    if (enabledDynamicStyle) {
      const inputWidth = inputRef.current?.clientWidth || 1;
      const spanWidth = spanRef.current?.clientWidth || 0;
      const percent = (spanWidth / inputWidth) * 100;
      if (percent < 10) {
        setDynamicStyle("text-[3.75rem] font-extralight");
      } else if (percent < 20) {
        setDynamicStyle("text-[3rem] font-light");
      } else if (percent < 30) {
        setDynamicStyle("text-[2.25rem] font-light");
      } else if (percent < 40) {
        setDynamicStyle("text-[1.875rem] font-normal");
      } else if (percent < 50) {
        setDynamicStyle("text-[1.5rem] font-normal");
      } else if (percent < 60) {
        setDynamicStyle("text-[1.25rem] font-medium");
      } else {
        setDynamicStyle("text-[1.125rem] font-medium");
      }
    }
  }, [value, enabledDynamicStyle]);

  useEffect(() => {
    // Fire onChange to update value
    if (token && token.decimals !== tokenRef.current?.decimals) {
      const parsed = parseValue(value.input, token.decimals);
      insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
      exceededRef.current = typeof max === "bigint" && max < parsed.value ? true : false;
      const valid = !(insufficientRef.current || exceededRef.current);
      onChange({ valid, ...parsed });
    }
    tokenRef.current = token;
  }, [value, token, balance, max, onChange]);

  useEffect(() => {
    // Recalculate the maximum value
    if (token && enablingMax && isExceeded) {
      const decimals = token.decimals;
      const parsed = parseValue(formatUnits(max ?? 0n, decimals), decimals);
      insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
      exceededRef.current = typeof max === "bigint" && max < parsed.value ? true : false;
      const valid = !(insufficientRef.current || exceededRef.current);
      onChange({ valid, ...parsed });
    }
  }, [token, max, balance, enablingMax, isExceeded, onChange]);

  return (
    <div
      className={`normal-input-wrap relative flex flex-col rounded-middle bg-inner px-small py-small lg:px-middle ${
        compact ? "lg:py-middle" : ""
      } ${value.valid ? "valid-input-wrap border-transparent" : "invalid-input-wrap"}`}
    >
      <div className="flex items-center justify-between gap-small">
        <Input
          placeholder={_placeholder}
          className={`w-full rounded bg-transparent text-white transition-[font-size,font-weight,line-height] duration-300 ${
            compact ? "" : "h-12"
          } ${enabledDynamicStyle ? `leading-none ${dynamicStyle}` : "text-sm font-medium"}`}
          onChange={handleChange}
          ref={inputRef}
          disabled={disabled}
          value={value.input}
          autoFocus
        />

        {compact ? (
          suffix === "symbol" && token ? (
            <span className="text-sm font-medium">{token.symbol}</span>
          ) : suffix === "max" ? (
            <button
              className="inline-flex items-center bg-transparent px-2 py-1 transition-[transform,color] hover:scale-105 hover:bg-white/[0.15] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
              onClick={handleMax}
              disabled={max === undefined || token === undefined}
            >
              <span className="text-sm font-medium">Max</span>
            </button>
          ) : null
        ) : (
          <div className="flex shrink-0 items-center gap-middle self-end">
            {token ? (
              <div className="flex shrink-0 items-center gap-small">
                <Image width={26} height={26} alt="Token" src={getTokenLogoSrc(token.logo)} className="rounded-full" />
                <span className="text-base font-medium text-white">{token.symbol}</span>
              </div>
            ) : null}
            {tokenOptions
              .filter((t) => t.symbol !== token?.symbol)
              .map((t) => (
                <Image
                  key={t.symbol}
                  width={26}
                  height={26}
                  alt="Token"
                  src={getTokenLogoSrc(t.logo)}
                  className="rounded-full opacity-80 transition-transform duration-300 hover:cursor-pointer hover:opacity-100 active:-translate-x-1"
                  onClick={() => onTokenChange(t)}
                />
              ))}
          </div>
        )}
      </div>

      {!compact && token ? (
        <div className="flex items-center gap-small">
          <span className="text-xs font-medium text-white/50">
            Balance: {formatBalance(balance ?? 0n, token.decimals)}
          </span>
          <button
            className={`rounded-full bg-white/20 p-[3px] opacity-50 transition hover:bg-white/20 hover:opacity-100 active:scale-95 ${
              balanceLoading ? "animate-spin" : ""
            }`}
            onClick={onBalanceRefresh}
          >
            <Image alt="Refresh" width={14} height={14} src="/images/refresh.svg" />
          </button>
          {typeof max === "bigint" ? (
            <button
              className="inline-flex items-center rounded-small bg-white/10 px-1 py-[1px] text-xs font-medium text-white/50 transition hover:bg-white/20 hover:text-white active:scale-95"
              onClick={handleMax}
            >
              Max
            </button>
          ) : null}
        </div>
      ) : null}

      {value.valid ? null : exceededRef.current ? (
        <InputAlert text={`* Max: ${formatBalance(max || 0n, token?.decimals || 0, { precision: 6 })}`} />
      ) : insufficientRef.current ? (
        <InputAlert text="* Insufficient" />
      ) : null}

      <span className="invisible fixed left-0 top-0 -z-50" ref={spanRef}>
        {value.input}
      </span>
    </div>
  );
}

function parseValue(source: string, decimals: number) {
  let input = "";
  let value = 0n;
  const [i, d] = source.replace(/,/g, "").split(".").concat("-1"); // The commas must be removed or parseUnits will error
  if (i) {
    input = d === "-1" ? i : d ? `${i}.${d.slice(0, decimals)}` : `${i}.`;
    value = parseUnits(input, decimals);
  }
  return { value, input };
}
