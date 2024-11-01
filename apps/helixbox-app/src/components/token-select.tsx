import { Token } from "../types/token";
import Select from "../ui/select";
import { getTokenLogoSrc } from "../utils";
import PrettyAddress from "./pretty-address";

interface Props {
  options: Token[];
  disabled?: boolean;
  value?: Token;
  placeholder?: string;
  onChange?: (value: Token | undefined) => void;
}

export default function TokenSelect({ options, disabled, value, placeholder, onChange = () => undefined }: Props) {
  return (
    <Select
      clearable
      sameWidth
      labelClassName="gap-small flex items-center justify-between rounded-xl bg-app-bg h-11 px-medium"
      childClassName="bg-app-bg py-medium flex flex-col rounded-xl border border-white/20 max-h-52 overflow-y-auto app-scrollbar"
      label={
        value ? (
          <div className="gap-medium flex items-center truncate">
            <img
              alt="Chain"
              width={22}
              height={22}
              src={getTokenLogoSrc(value.logo)}
              className="hidden shrink-0 rounded-full lg:inline"
            />
            <span className="truncate text-sm font-semibold text-white">{value.symbol}</span>
          </div>
        ) : undefined
      }
      placeholder={<span className="text-sm font-semibold text-slate-400">{placeholder}</span>}
      disabled={disabled}
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((option) => (
          <button
            key={option.symbol}
            onClick={() => {
              onChange(option);
            }}
            className="gap-medium px-large py-small flex items-center transition hover:bg-white/5"
          >
            <img width={26} height={26} alt="Token" src={getTokenLogoSrc(option.logo)} className="rounded-full" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-white">{option.symbol}</span>
              {option.type === "native" ? (
                <span className="text-xs font-medium text-white/50">native token</span>
              ) : (
                <PrettyAddress address={option.address} copyable className="text-xs font-medium text-white/50" />
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="inline-flex justify-center p-2">
          <span className="text-sm font-semibold text-slate-400">No data</span>
        </div>
      )}
    </Select>
  );
}
