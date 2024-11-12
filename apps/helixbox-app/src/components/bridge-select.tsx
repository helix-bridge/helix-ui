import { BridgeCategory } from "../types/bridge";
import Select from "../ui/select";
import { bridgeFactory } from "../utils/bridge";

interface Props {
  options?: BridgeCategory[];
  value?: BridgeCategory;
  onChange?: (value: BridgeCategory | undefined) => void;
}

export default function BridgeSelect({ value, options = [], onChange = () => undefined }: Props) {
  return (
    <Select
      labelClassName="bg-inner p-medium flex items-center justify-between rounded-medium transition-transform lg:active:translate-y-1"
      childClassName="bg-inner p-medium flex flex-col rounded-medium gap-small border border-component"
      label={<span className="text-sm font-medium text-white">{bridgeName(value)}</span>}
      placeholder={<span className="text-sm font-medium text-slate-400">Select a bridge</span>}
      sameWidth
      clearable
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        options.map((c) => {
          return (
            <button
              key={c}
              onClick={() => {
                onChange(c);
              }}
              className="rounded-medium bg-component px-medium py-small text-start text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {bridgeName(c) || "-"}
            </button>
          );
        })
      ) : (
        <div className="rounded-medium bg-component px-medium py-small">
          <span className="text-sm font-medium text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}

function bridgeName(category: BridgeCategory | null | undefined) {
  if (category) {
    const bridge = bridgeFactory({ category });
    return bridge ? bridge.getName() : category === "lnbridge" ? "Helix LnBridge" : undefined;
  }
  return undefined;
}
