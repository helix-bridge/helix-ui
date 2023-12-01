import { InputValue } from "@/types";
import Input from "@/ui/input";
import InputAlert from "@/ui/input-alert";
import { isValidFeeRate, parseFeeRate } from "@/utils";
import { ChangeEventHandler, useCallback } from "react";

interface Props {
  placeholder?: string;
  value: InputValue<number>;
  onChange?: (value: InputValue<number>) => void;
}

export default function FeeRateInput({ placeholder, value, onChange = () => undefined }: Props) {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const input = e.target.value;
      let valid = true;
      let value = 0;
      if (input) {
        if (!Number.isNaN(Number(input))) {
          value = parseFeeRate(input);
          valid = isValidFeeRate(value);
          onChange({ valid, value, input });
        }
      } else {
        onChange({ valid, value, input });
      }
    },
    [onChange],
  );

  return (
    <div
      className={`gap-small bg-inner p-small lg:p-middle normal-input-wrap rounded-middle relative flex items-center justify-between ${
        value.valid ? "valid-input-wrap border-transparent" : "invalid-input-wrap"
      }`}
    >
      <Input
        className="w-full rounded bg-transparent text-sm font-medium text-white"
        placeholder={placeholder}
        onChange={handleChange}
        value={value.input}
      />
      <span className="rounded bg-transparent text-sm font-medium text-white">%</span>

      {value.valid ? null : <InputAlert text="* Please enter 0 ~ 0.25" />}
    </div>
  );
}
