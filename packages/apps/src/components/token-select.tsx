import { Token } from "@/types/token";
import Select from "@/ui/select";
import { getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import PrettyAddress from "./pretty-address";

interface Props {
  options: Token[];
  disabled?: boolean;
  value?: Token;
  placeholder?: string;
  className?: string;
  onChange?: (value: Token | undefined) => void;
}

export default function TokenSelect({
  options,
  disabled,
  value,
  placeholder,
  className,
  onChange = () => undefined,
}: Props) {
  return (
    <Select
      labelClassName={`gap-small flex items-center justify-between rounded-middle ${className}`}
      childClassName="bg-inner py-middle flex flex-col rounded-middle border border-component"
      label={value ? <span className="text-sm font-medium text-white">{value.symbol}</span> : undefined}
      placeholder={<span className="text-sm font-medium text-slate-400">{placeholder}</span>}
      disabled={disabled}
      clearable
      sameWidth
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((option) => (
          <button
            key={option.symbol}
            onClick={() => {
              onChange(option);
            }}
            className="py-small px-large gap-middle flex items-center transition hover:bg-white/5"
          >
            <Image width={26} height={26} alt="Token" src={getTokenLogoSrc(option.logo)} className="rounded-full" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-white">{option.symbol}</span>
              {option.type === "native" ? (
                <span className="text-xs font-medium text-white/50">Native token</span>
              ) : (
                <PrettyAddress address={option.address} copyable className="text-xs font-medium text-white/50" />
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="py-small px-large text-center">
          <span className="text-sm font-medium text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
