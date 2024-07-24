type Version = "v2" | "v3";

interface Props {
  value: Version;
  onChange: (value: Version) => void;
}

export default function VersionSwitch({ value, onChange }: Props) {
  return (
    <div className="relative flex items-center rounded-full bg-[#343946] p-1">
      <div
        className="bg-primary absolute left-1 top-1 inline-flex h-7 w-12 items-center justify-center rounded-full transition-transform"
        style={{ transform: value === "v3" ? "translate(0, 0)" : "translate(3rem, 0)" }}
      >
        <span className="text-sm font-bold uppercase text-white/90">{value}</span>
      </div>

      <span
        className="inline-flex h-7 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("v3")}
      >
        V3
      </span>
      <span
        className="inline-flex h-7 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("v2")}
      >
        V2
      </span>
    </div>
  );
}
