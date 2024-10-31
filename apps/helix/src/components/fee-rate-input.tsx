import { InputValue } from "../types";
import Input from "../ui/input";
import InputAlert from "../ui/input-alert";
import { isValidFeeRate, parseFeeRate } from "../utils";
import { ChangeEventHandler, useCallback } from "react";

interface Props {
  isV3?: boolean;
  placeholder?: string;
  value: InputValue<number>;
  className?: string;
  onChange?: (value: InputValue<number>) => void;
}

export default function FeeRateInput({ isV3, placeholder, value, className, onChange = () => undefined }: Props) {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const input = e.target.value;
      let valid = true;
      let value = 0;
      if (input) {
        if (!Number.isNaN(Number(input))) {
          value = parseFeeRate(input);
          valid = isValidFeeRate(value, isV3);
          onChange({ valid, value, input });
        }
      } else {
        onChange({ valid, value, input });
      }
    },
    [isV3, onChange],
  );

  return (
    <div
      className={`normal-input-wrap gap-small relative flex items-center justify-between ${className} ${
        value.valid ? "valid-input-wrap border-transparent" : "invalid-input-wrap"
      }`}
    >
      <Input
        className="w-full rounded bg-transparent"
        placeholder={placeholder}
        onChange={handleChange}
        value={value.input}
      />
      <span className="rounded bg-transparent">%</span>

      {value.valid ? null : <InputAlert text={`* Please enter 0 ~ ${isV3 ? "100" : "0.25"}`} />}
    </div>
  );
}
