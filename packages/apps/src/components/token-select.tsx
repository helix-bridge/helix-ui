import { Token } from "@/types/token";
import ISelect from "@/ui/select";
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
    <ISelect
      labelClassName={`gap-small flex items-center justify-between border-transparent disabled:border-transparent ${className}`}
      childClassName="bg-component border-primary py-small flex flex-col border-radius border"
      label={value ? <span className="text-sm font-normal text-white">{value.symbol}</span> : undefined}
      placeholder={<span className="text-sm font-normal text-slate-400">{placeholder}</span>}
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
            className="py-small px-large hover:text-primary gap-middle flex items-center text-start text-sm transition hover:opacity-80"
          >
            <Image width={28} height={28} alt="Token" src={getTokenLogoSrc(option.logo)} className="rounded-full" />
            <div className="flex flex-col">
              <span>{option.symbol}</span>
              {option.type === "native" ? (
                <span className="text-xs text-white/50">Native token</span>
              ) : (
                <PrettyAddress address={option.address} copyable className="text-xs text-white/50" />
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="py-small px-large">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </ISelect>
  );
}
