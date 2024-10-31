import { BridgeVersion } from "../../types";

interface Props {
  value: BridgeVersion;
  onChange: (value: BridgeVersion) => void;
}

export default function VersionSwitch({ value, onChange }: Props) {
  return (
    <div className="bg-secondary relative flex items-center rounded-full p-1">
      <div
        className="bg-primary absolute left-1 top-1 inline-flex h-6 w-12 items-center justify-center rounded-full transition-transform"
        style={{ transform: value === "lnv3" ? "translate(0, 0)" : "translate(3rem, 0)" }}
      >
        <span className="text-sm font-bold uppercase text-white/90">{value === "lnv3" ? "v3" : "v2"}</span>
      </div>

      <span
        className="inline-flex h-6 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("lnv3")}
      >
        V3
      </span>
      <span
        className="inline-flex h-6 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("lnv2")}
      >
        V2
      </span>
    </div>
  );
}
