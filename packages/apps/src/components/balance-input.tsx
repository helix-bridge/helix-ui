import { InputValue, Token } from "@/types";
import Input from "@/ui/input";
import InputAlert from "@/ui/input-alert";
import { formatBalance, getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, parseUnits } from "viem";

interface Props {
  placeholder?: string;
  balance?: bigint;
  max?: bigint;
  compact?: boolean;
  suffix?: "symbol" | "max";
  enabledDynamicStyle?: boolean;
  value: InputValue<bigint>;
  token: Token | undefined;
  tokenOptions?: Token[];
  onChange?: (value: InputValue<bigint>) => void;
  onTokenChange?: (token: Token) => void;
}

export function BalanceInput({
  placeholder,
  balance,
  max,
  compact,
  suffix,
  enabledDynamicStyle,
  value,
  token,
  tokenOptions = [],
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

  const isExceeded = useMemo(() => (max && max < value.value ? true : false), [max, value]);

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

      if (input && token && !Number.isNaN(Number(input))) {
        parsed = parseValue(input, token.decimals);
        insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
        exceededRef.current = max && max < parsed.value ? true : false;
        valid = !(insufficientRef.current || exceededRef.current);
      }
      setEnablingMax(false);

      onChange({ valid, ...parsed });
    },
    [token, max, balance, onChange],
  );

  useEffect(() => {
    if (enabledDynamicStyle) {
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
  }, [value, enabledDynamicStyle]);

  useEffect(() => {
    // Fire onChange to update value
    if (token && token.decimals !== tokenRef.current?.decimals) {
      const parsed = parseValue(value.input, token.decimals);
      insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
      exceededRef.current = max && max < parsed.value ? true : false;
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
      exceededRef.current = max && max < parsed.value ? true : false;
      const valid = !(insufficientRef.current || exceededRef.current);
      onChange({ valid, ...parsed });
    }
  }, [token, max, balance, enablingMax, isExceeded, onChange]);

  return (
    <div
      className={`lg:px-middle px-small py-small bg-app-bg normal-input-wrap relative flex flex-col  ${
        value.valid ? "valid-input-wrap" : "invalid-input-wrap"
      }`}
    >
      <div className="gap-small flex items-center justify-between">
        <Input
          placeholder={_placeholder}
          className={`h-12 w-full rounded bg-transparent text-white transition-[font-size,font-weight,line-height] duration-300 ${
            enabledDynamicStyle && value.value ? `leading-none ${dynamicStyle}` : "text-sm font-medium"
          }`}
          onChange={handleChange}
          ref={inputRef}
          value={value.input}
        />

        {compact ? (
          suffix === "symbol" && token ? (
            <span className="text-sm">{token.symbol}</span>
          ) : suffix === "max" ? (
            <button
              className="inline-flex items-center bg-transparent px-2 py-1 transition-[transform,color] hover:scale-105 hover:bg-white/[0.15] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                const decimals = token?.decimals || 0;
                const parsed = parseValue(formatUnits(max ?? 0n, decimals), decimals);
                insufficientRef.current = balance !== undefined && balance < parsed.value ? true : false;
                exceededRef.current = max && max < parsed.value ? true : false;
                const valid = !(insufficientRef.current || exceededRef.current);
                onChange({ valid, ...parsed });
                setEnablingMax(true);
              }}
              disabled={max === undefined || token === undefined}
            >
              <span className="text-sm font-medium">Max</span>
            </button>
          ) : null
        ) : (
          <div className="gap-small flex items-end">
            {token ? (
              <div className="gap-small flex shrink-0 items-center">
                <Image width={18} height={18} alt="Token" src={getTokenLogoSrc(token.logo)} />
              </div>
            ) : null}
            {tokenOptions.map((t) => (
              <Image
                key={t.symbol}
                width={18}
                height={18}
                alt="Token"
                src={getTokenLogoSrc(t.logo)}
                className="hover:cursor-pointer"
                onClick={() => onTokenChange(t)}
              />
            ))}
          </div>
        )}
      </div>

      {!compact && balance !== undefined && token ? (
        <div className="gap-small flex items-center">
          <span>Balance: {formatBalance(balance, token.decimals)}</span>
          <span>Refresh</span>
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
