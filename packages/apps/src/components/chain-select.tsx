import { ChainConfig } from "@/types";
import Select from "@/ui/select";
import { getChainLogoSrc } from "@/utils";
import { Placement } from "@floating-ui/react";
import Image from "next/image";

interface Props {
  options?: ChainConfig[];
  value?: ChainConfig;
  placeholder?: string;
  compact?: boolean;
  placement?: Placement;
  className?: string;
  onChange?: (value: ChainConfig | undefined) => void;
}

export default function ChainSelect({
  value,
  placeholder,
  compact,
  placement,
  className,
  options = [],
  onChange = () => undefined,
}: Props) {
  return (
    <Select
      labelClassName={`gap-small flex items-center justify-between ${className}`}
      childClassName="bg-component border-line py-small flex flex-col rounded border max-h-60 overflow-y-auto"
      label={value ? <span className="truncate text-sm font-normal text-white">{value.name}</span> : undefined}
      placeholder={<span className="truncate text-sm font-normal text-slate-400">{placeholder}</span>}
      placement={placement}
      sameWidth={compact ? false : true}
      clearable={compact ? true : false}
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        compact ? (
          options.map((option) => {
            return (
              <button
                key={option.id}
                onClick={() => onChange(option)}
                className="py-small px-large text-start transition-colors hover:bg-white/10"
              >
                <Image width={18} height={18} alt="Chain logo" src={getChainLogoSrc(option.logo)} />
                <span className="text-sm">{option.name}</span>
              </button>
            );
          })
        ) : (
          <div className="grid grid-cols-2">
            {options.map((option) => (
              <button
                key={option.id}
                className="gap-small flex w-36 shrink-0 items-center truncate"
                onClick={() => onChange(option)}
              >
                <Image width={18} height={18} alt="Chain logo" src={getChainLogoSrc(option.logo)} />
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="py-small px-large">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
