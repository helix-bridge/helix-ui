import Input from "@/ui/input";
import { isValidFeeRate, parseFeeRate } from "@/utils/misc";

export default function FeeRateInput({
  placeholder,
  value,
  onChange = () => undefined,
}: {
  placeholder?: string;
  value?: { formatted: number; value: string };
  onChange?: (value: { formatted: number; value: string }) => void;
}) {
  const invalid = !isValidFeeRate(value?.formatted || 0);
  return (
    <div
      className={`gap-small bg-app-bg p-small lg:p-middle normal-input-wrap flex items-center justify-between ${
        invalid ? "invalid-input-wrap" : "valid-input-wrap border-transparent"
      }`}
    >
      <Input
        className="w-full rounded bg-transparent text-sm font-medium text-white"
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value))) {
              onChange({ value: e.target.value, formatted: parseFeeRate(e.target.value) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0 });
          }
        }}
        value={value?.value}
      />
      <span className="rounded bg-transparent text-sm font-medium text-white">%</span>
    </div>
  );
}
