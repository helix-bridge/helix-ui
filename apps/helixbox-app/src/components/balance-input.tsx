import { InputValue, Token } from "../types";
import Input from "../ui/input";
import InputAlert from "../ui/input-alert";
import { formatBalance } from "../utils";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseUnits } from "viem";

enum ErrorCode {
  INSUFFICIENT = 1,
  REQUIRE_MORE,
  REQUIRE_LESS,
}

interface Props {
  max?: bigint;
  min?: bigint;
  disabled?: boolean;
  balance?: bigint;
  placeholder?: string;
  value: InputValue<bigint>;
  token: Token | undefined;
  onChange?: (value: InputValue<bigint>) => void;
}

export function BalanceInput({
  max,
  min,
  balance,
  disabled,
  placeholder,
  value,
  token,
  onChange = () => undefined,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const balanceRef = useRef(balance);
  const tokenRef = useRef(token);

  const [errorCode, setErrorCode] = useState<ErrorCode>();

  const _placeholder = useMemo(() => {
    if (token?.decimals) {
      if (max !== undefined) {
        return `Max ${formatBalance(max, token.decimals)}`;
      } else if (balance !== undefined) {
        return `Balance ${formatBalance(balance, token.decimals)}`;
      }
    }
    return placeholder ?? "Enter an amount";
  }, [balance, max, placeholder, token?.decimals]);

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

  return (
    <div
      className={`normal-input-wrap relative ${
        value.valid ? "valid-input-wrap border-transparent" : "invalid-input-wrap"
      } bg-app-bg px-medium rounded-xl`}
    >
      <div className="gap-small flex h-10 items-center justify-between text-sm font-semibold text-white lg:h-11">
        <Input
          placeholder={_placeholder}
          className="w-full rounded bg-transparent"
          onChange={handleChange}
          ref={inputRef}
          disabled={disabled}
          value={value.input}
        />

        {token ? <span>{token.symbol}</span> : null}
      </div>

      {errorCode === ErrorCode.INSUFFICIENT ? (
        <InputAlert text="* Insufficient" />
      ) : errorCode === ErrorCode.REQUIRE_LESS ? (
        <InputAlert text={`* Max: ${formatBalance(max ?? 0n, token?.decimals ?? 0, { precision: 6 })}`} />
      ) : errorCode === ErrorCode.REQUIRE_MORE ? (
        <InputAlert text={`* Min: ${formatBalance(min ?? 0n, token?.decimals ?? 0, { precision: 6 })}`} />
      ) : null}
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
