import { BridgeCategory } from "@/types/bridge";
import Select from "@/ui/select";
import { bridgeFactory } from "@/utils/bridge";

interface Props {
  options?: BridgeCategory[];
  value?: BridgeCategory;
  onChange?: (value: BridgeCategory | undefined) => void;
}

export default function BridgeSelect({ value, options = [], onChange = () => undefined }: Props) {
  const bridge = value ? bridgeFactory({ category: value }) : undefined;

  return (
    <Select
      labelClassName="bg-app-bg p-middle flex items-center justify-between border-transparent"
      childClassName="bg-app-bg border-primary/50 py-small flex flex-col rounded border"
      label={bridge ? <span className="text-sm font-normal text-white">{bridge.getName()}</span> : undefined}
      placeholder={<span className="text-sm font-normal text-slate-400">Select a bridge</span>}
      sameWidth
      clearable
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((c) => {
          const b = bridgeFactory({ category: c });
          return (
            <button
              key={c}
              onClick={() => {
                onChange(c);
              }}
              className="px-middle py-small text-start text-sm text-white transition-colors hover:bg-white/10"
            >
              {b?.getName() || "-"}
            </button>
          );
        })
      ) : (
        <div className="px-middle py-small">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
