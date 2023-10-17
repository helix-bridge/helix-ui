import Input from "@/ui/input";
import { InputHTMLAttributes, forwardRef } from "react";
import { isAddress } from "viem";

export default forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function AddressInput(
  { className, value, ...rest },
  ref,
) {
  const invalid = !!value && !(typeof value === "string" && isAddress(value));

  return (
    <div
      className={`bg-app-bg lg:px-middle px-small normal-input-wrap relative border-transparent py-1 ${
        invalid ? "invalid-input-wrap" : "valid-input-wrap"
      }`}
    >
      <Input
        className={`h-8 w-full rounded bg-transparent text-sm text-white ${className}`}
        value={value}
        ref={ref}
        {...rest}
      />
      {invalid && <Message text="* Invalid recipient" />}
    </div>
  );
});

function Message({ text }: { text: string }) {
  return (
    <div className="absolute -bottom-5 left-0 w-full">
      <span className="text-app-red text-xs font-light">{text}</span>
    </div>
  );
}
