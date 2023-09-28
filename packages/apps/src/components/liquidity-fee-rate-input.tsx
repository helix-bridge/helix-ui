export default function LiquidityFeeRateInput({
  placeholder,
  value,
  onChange = () => undefined,
}: {
  placeholder?: string;
  value?: { formatted: number; value: string };
  onChange?: (value: { formatted: number; value: string }) => void;
}) {
  return (
    <div className="gap-small bg-app-bg p-small lg:p-middle hover:border-line focus-within:border-line flex items-center justify-between rounded border border-transparent transition-colors">
      <input
        className="w-full rounded bg-transparent text-sm font-medium text-white focus-visible:outline-none"
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value))) {
              onChange({ value: e.target.value, formatted: Number(e.target.value) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0 });
          }
        }}
        value={value?.value}
      />
      <span className="rounded bg-transparent text-sm font-medium text-white focus-visible:outline-none">%</span>
    </div>
  );
}
