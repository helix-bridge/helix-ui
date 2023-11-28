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
      labelClassName="bg-inner p-middle flex items-center justify-between rounded-middle transition-transform lg:active:translate-y-1"
      childClassName="bg-inner p-middle flex flex-col rounded-middle gap-small border border-component"
      label={bridge ? <span className="text-sm font-medium text-white">{bridge.getName()}</span> : undefined}
      placeholder={<span className="text-sm font-medium text-slate-400">Select a bridge</span>}
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
              className="px-middle py-small bg-component rounded-middle text-start text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {b?.getName() || "-"}
            </button>
          );
        })
      ) : (
        <div className="px-middle py-small bg-component rounded-middle">
          <span className="text-sm font-medium text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
