import { ChainConfig } from "@/types/chain";
import ISelect from "@/ui/i-select";

interface Props {
  options: ChainConfig[];
  value?: ChainConfig;
  placeholder?: string;
  className?: string;
  onChange?: (value: ChainConfig | undefined) => void;
}

export default function ChainSelect({ options, value, placeholder, className, onChange = () => undefined }: Props) {
  return (
    <ISelect
      labelClassName={`gap-small flex items-center justify-between ${className}`}
      childClassName="bg-component border-primary py-small flex flex-col border-radius border"
      label={value ? <span className="truncate text-sm font-normal text-white">{value.name}</span> : undefined}
      placeholder={<span className="truncate text-sm font-normal text-slate-400">{placeholder}</span>}
      clearable
      sameWidth
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((option) => {
          return (
            <button
              key={option.id}
              onClick={() => {
                onChange(option);
              }}
              className="py-small px-large text-start text-sm transition-colors hover:bg-white/10"
            >
              {option.name}
            </button>
          );
        })
      ) : (
        <div className="py-small px-large">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </ISelect>
  );
}
