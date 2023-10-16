import { Token } from "@/types/token";
import ISelect from "@/ui/i-select";
import { toShortAdrress } from "@/utils/address";
import { getTokenLogoSrc } from "@/utils/misc";
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
      labelClassName={`gap-small flex items-center justify-between rounded border border-transparent transition-colors duration-300 ${className}`}
      childClassName="bg-component border-line py-small flex flex-col rounded border"
      label={value ? <span className="text-sm font-normal text-white">{value.symbol}</span> : undefined}
      placeholder={<span className="text-sm font-normal text-white/50">{placeholder}</span>}
      disabled={disabled}
      clearable
      sameWidth
      onClear={() => onChange(undefined)}
    >
      {options.map((option) => (
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
            <PrettyAddress address={option.address} copyable className="text-xs font-light text-white/50" />
          </div>
        </button>
      ))}
    </ISelect>
  );
}
