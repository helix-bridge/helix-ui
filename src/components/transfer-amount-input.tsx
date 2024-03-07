import { Token } from "@/types";
import { formatBalance } from "@/utils";
import Image from "next/image";
import { ChangeEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";

interface Value {
  input: string;
  value: bigint;
  valid: boolean;
}

interface Props {
  token: Token;
  value: Value;
  balance: bigint;
  loading?: boolean;
  onRefresh?: () => void;
  onChange?: (value: Value) => void;
}

export default function TransferAmountInput({
  token,
  value,
  balance,
  loading,
  onRefresh,
  onChange = () => undefined,
}: Props) {
  const [dynamicFont, setDynamicFont] = useState("text-[3.75rem] font-extralight");
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const tokenRef = useRef(token);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const input = e.target.value;
      let parsed = { value: 0n, input: "" };
      let valid = true;

      if (input) {
        if (!Number.isNaN(Number(input))) {
          parsed = parseAmount(input, token.decimals);
          valid = parsed.value <= balance;
          onChange({ valid, ...parsed });
        }
      } else {
        onChange({ valid, ...parsed });
      }
    },
    [token, balance, onChange],
  );

  useEffect(() => {
    const inputWidth = inputRef.current?.clientWidth || 1;
    const spanWidth = spanRef.current?.clientWidth || 0;
    const percent = (spanWidth / inputWidth) * 100;
    if (percent < 10) {
      setDynamicFont("text-[3.75rem] font-extralight");
    } else if (percent < 20) {
      setDynamicFont("text-[3rem] font-light");
    } else if (percent < 30) {
      setDynamicFont("text-[2.25rem] font-light");
    } else if (percent < 40) {
      setDynamicFont("text-[1.875rem] font-normal");
    } else if (percent < 50) {
      setDynamicFont("text-[1.5rem] font-normal");
    } else if (percent < 60) {
      setDynamicFont("text-[1.25rem] font-medium");
    } else {
      setDynamicFont("text-[1.125rem] font-semibold");
    }
  }, [value.input]);

  useEffect(() => {
    if (token.decimals !== tokenRef.current.decimals) {
      tokenRef.current = token;
      onChange({ input: "", value: 0n, valid: true });
    }
  }, [token, onChange]);

  return (
    <div className="flex flex-col gap-medium px-medium">
      <input
        className={`${dynamicFont} h-12 bg-transparent text-white transition-[font-size,font-weight,line-height] duration-300 focus-visible:outline-none`}
        ref={inputRef}
        placeholder="0"
        value={value.input}
        onChange={handleChange}
      />
      <div className="flex items-center gap-small">
        <span className="text-sm font-normal text-white/50">Balance: {formatBalance(balance, token.decimals)}</span>
        <button
          className={`rounded-full bg-white/20 p-[3px] opacity-50 transition hover:opacity-100 active:scale-95 ${
            loading ? "animate-spin" : ""
          }`}
          onClick={onRefresh}
        >
          <Image alt="Refresh balance" width={14} height={14} src="/images/refresh.svg" />
        </button>
      </div>

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
