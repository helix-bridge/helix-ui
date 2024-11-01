import { InputValue } from "../types";
import Input from "../ui/input";
import InputAlert from "../ui/input-alert";
import { ChangeEventHandler, useCallback } from "react";
import { isAddress } from "viem";

interface Props {
  value: InputValue<string>;
  placeholder?: string;
  className?: string;
  onChange?: (value: InputValue<string>) => void;
}

export default function AddressInput({ value, placeholder, className, onChange = () => undefined }: Props) {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const input = e.target.value;
      const valid = input ? isAddress(input) : true;
      onChange({ input, value: input, valid });
    },
    [onChange],
  );

  return (
    <div
      className={`normal-input-wrap px-small lg:px-medium relative ${
        value.valid ? "valid-input-wrap" : "invalid-input-wrap"
      } ${className}`}
    >
      <Input value={value.input} placeholder={placeholder} onChange={handleChange} />
      {value.valid ? null : <InputAlert text="* Invalid address" />}
    </div>
  );
}
