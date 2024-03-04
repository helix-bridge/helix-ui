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
      labelClassName={`gap-small flex items-center justify-between rounded-medium ${className}`}
      childClassName="bg-inner py-medium flex flex-col rounded-medium border border-component"
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
            className="flex items-center gap-medium px-large py-small transition hover:bg-white/5"
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
        <div className="px-large py-small text-center">
          <span className="text-sm font-medium text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
