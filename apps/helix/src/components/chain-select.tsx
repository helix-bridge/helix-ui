import { ChainConfig } from "../types";
import Select from "../ui/select";
import { getChainLogoSrc } from "../utils";

interface Props {
  options?: ChainConfig[];
  value?: ChainConfig;
  placeholder?: string;
  className?: string;
  onChange?: (value: ChainConfig | undefined) => void;
}

export default function ChainSelect({
  value,
  placeholder,
  className,
  options = [],
  onChange = () => undefined,
}: Props) {
  return (
    <Select
      sameWidth
      clearable
      label={
        value ? (
          <div className="gap-medium flex items-center truncate">
            <img
              alt="Chain"
              width={22}
              height={22}
              src={getChainLogoSrc(value.logo)}
              className="hidden shrink-0 rounded-full lg:inline"
            />
            <span className="truncate text-sm font-semibold text-white">{value.name}</span>
          </div>
        ) : undefined
      }
      placeholder={<span className="truncate text-sm font-semibold text-slate-400">{placeholder}</span>}
      labelClassName={`gap-small flex items-center justify-between ${className}`}
      childClassName="bg-app-bg flex flex-col rounded-xl max-h-64 overflow-y-auto border border-white/20 py-small"
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((option) => {
          return (
            <button
              key={option.id}
              disabled={value?.id === option.id}
              onClick={() => onChange(option)}
              className="gap-medium px-large py-medium flex items-center text-start transition-colors hover:bg-white/5 disabled:bg-white/10"
            >
              <img
                width={22}
                height={22}
                alt={option.name}
                src={getChainLogoSrc(option.logo)}
                className="rounded-full"
              />
              <span className="truncate text-sm font-semibold text-white">{option.name}</span>
            </button>
          );
        })
      ) : (
        <div className="inline-flex justify-center p-2">
          <span className="text-sm font-semibold text-slate-400">No data</span>
        </div>
      )}
    </Select>
  );
}
