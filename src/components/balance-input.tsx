import { InputValue, Token } from "@/types";
import Input from "@/ui/input";
import InputAlert from "@/ui/input-alert";
import { formatBalance, getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseUnits } from "viem";

enum ErrorCode {
  INSUFFICIENT = 1,
  REQUIRE_MORE,
  REQUIRE_LESS,
}

interface Props {
  placeholder?: string;
  balance?: bigint;
  max?: bigint;
  min?: bigint;
  compact?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  suffix?: "symbol";
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
  min,
  compact,
  autoFocus,
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
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const balanceRef = useRef(balance);
  const tokenRef = useRef(token);

  const [dynamicStyle, setDynamicStyle] = useState("text-sm font-medium");
  const [errorCode, setErrorCode] = useState<ErrorCode>();

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
          parsed = parseAmount(input, token.decimals);
          if (typeof min === "bigint" && parsed.value < min) {
            valid = false;
            setErrorCode(ErrorCode.REQUIRE_MORE);
          } else if (typeof max === "bigint" && max < parsed.value) {
            valid = false;
            setErrorCode(ErrorCode.REQUIRE_LESS);
          } else if (typeof balance === "bigint" && balance < parsed.value) {
            valid = false;
            setErrorCode(ErrorCode.INSUFFICIENT);
          } else {
            setErrorCode(undefined);
          }
          onChange({ valid, ...parsed });
        }
      } else {
        setErrorCode(undefined);
        onChange({ valid, ...parsed });
      }
    },
    [token, max, min, balance, onChange],
  );

  useEffect(() => {
    if (balance !== balanceRef.current) {
      balanceRef.current = balance;
      if (typeof balance === "bigint") {
        if (balance < value.value) {
          setErrorCode(ErrorCode.INSUFFICIENT);
          onChange({ ...value, valid: false });
        }
      } else {
        setErrorCode(undefined);
        onChange({ ...value, valid: true });
      }
    }
  }, [balance, value, onChange]);

  useEffect(() => {
    if (token?.decimals !== tokenRef.current?.decimals) {
      tokenRef.current = token;
      onChange({ valid: true, input: "", value: 0n });
    }
  }, [token, onChange]);

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
  }, [value.input, enabledDynamicStyle]);

  return (
    <div
      className={`normal-input-wrap relative flex flex-col rounded-xl bg-inner px-small py-small lg:px-middle ${
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
          autoFocus={autoFocus}
        />

        {compact ? (
          suffix === "symbol" && token ? (
            <span className="text-sm font-medium">{token.symbol}</span>
          ) : null
        ) : (
          <div className="flex shrink-0 items-center gap-middle self-end">
            {token ? (
              <div className="flex shrink-0 items-center gap-small">
                <Image width={32} height={32} alt="Token" src={getTokenLogoSrc(token.logo)} className="rounded-full" />
                <span className="text-sm font-extrabold text-white">{token.symbol}</span>
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
        </div>
      ) : null}

      {errorCode === ErrorCode.INSUFFICIENT ? (
        <InputAlert text="* Insufficient" />
      ) : errorCode === ErrorCode.REQUIRE_LESS ? (
        <InputAlert text={`* Max: ${formatBalance(max ?? 0n, token?.decimals ?? 0, { precision: 6 })}`} />
      ) : errorCode === ErrorCode.REQUIRE_MORE ? (
        <InputAlert text={`* Min: ${formatBalance(min ?? 0n, token?.decimals ?? 0, { precision: 6 })}`} />
      ) : null}

      <span className="invisible fixed left-0 top-0 -z-50" ref={spanRef}>
        {value.input}
      </span>
    </div>
  );
}

function parseAmount(source: string, decimals: number) {
  let input = "";
  let value = 0n;
  const [i, d] = source.replace(/,/g, "").split(".").concat("-1"); // The commas must be removed or parseUnits will error
  if (i) {
    input = d === "-1" ? i : d ? `${i}.${d.slice(0, decimals)}` : `${i}.`;
    value = parseUnits(input, decimals);
  }
  return { value, input };
}
