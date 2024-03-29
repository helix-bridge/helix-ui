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
      labelClassName={`gap-small rounded-xl flex items-center justify-between transition active:translate-y-1 ${className}`}
      childClassName={`bg-inner flex flex-col rounded-xl max-h-60 overflow-y-auto border border-component ${
        compact ? "py-small" : "p-middle"
      }`}
      label={
        value ? (
          <div className="flex items-center gap-middle truncate">
            {compact ? null : (
              <Image
                alt="Chain"
                width={32}
                height={32}
                src={getChainLogoSrc(value.logo)}
                className="h-8 w-8 shrink-0 rounded-full"
              />
            )}

            <span className="truncate text-sm font-extrabold text-white">{value.name}</span>
          </div>
        ) : undefined
      }
      placeholder={<span className="truncate text-sm font-medium text-slate-400">{placeholder}</span>}
      placement={placement}
      sameWidth={compact ? true : false}
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
                className="flex items-center gap-middle px-large py-2 text-start transition-colors hover:bg-white/10"
              >
                <Image
                  width={20}
                  height={20}
                  alt="Chain logo"
                  src={getChainLogoSrc(option.logo)}
                  className="rounded-full"
                />
                <span className="truncate text-sm font-bold text-white">{option.name}</span>
              </button>
            );
          })
        ) : (
          <div className="grid grid-cols-2 gap-small">
            {options.map((option) => (
              <button
                key={option.id}
                className="flex w-36 shrink-0 items-center gap-small truncate rounded-middle bg-component px-2 py-2 transition-colors hover:bg-white/20"
                onClick={() => onChange(option)}
              >
                <Image
                  width={20}
                  height={20}
                  alt="Chain logo"
                  src={getChainLogoSrc(option.logo)}
                  className="rounded-full"
                />
                <span className="truncate text-sm font-bold text-white">{option.name}</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="px-large py-small">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
