import { BridgeCategory } from "@/types/bridge";
import ISelect from "@/ui/i-select";
import { bridgeFactory } from "@/utils/bridge";

interface Props {
  options: BridgeCategory[];
  value?: BridgeCategory;
  onChange?: (value: BridgeCategory | undefined) => void;
}

export default function BridgeSelect({ options, value, onChange = () => undefined }: Props) {
  const active = value ? bridgeFactory({ category: value }) : undefined;

  return (
    <ISelect
      labelClassName="bg-app-bg hover:border-line p-middle flex items-center justify-between rounded border border-transparent transition-colors"
      childClassName="bg-component border-line py-small flex flex-col rounded border"
      label={active ? <span className="text-sm font-normal text-white">{active.getName()}</span> : undefined}
      placeholder={<span className="text-sm font-normal text-white/50">Select a bridge</span>}
      sameWidth
      onClear={() => onChange(undefined)}
    >
      {options.map((c) => {
        const b = bridgeFactory({ category: c });
        return (
          <button
            key={c}
            onClick={() => {
              onChange(c);
            }}
            className="px-middle py-small text-start text-sm font-light text-white transition-colors hover:bg-white/10"
          >
            {b?.getName() || "-"}
          </button>
        );
      })}
    </ISelect>
  );
}
