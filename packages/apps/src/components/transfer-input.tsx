import TokenSelect, { Item as TokenSelectItem, Value as TokenSelectValue } from "./token-select";

interface Props {
  items: TokenSelectItem[];
  value?: TokenSelectValue;
  isTarget?: boolean;
}

export default function TransferInput({ items, value, isTarget }: Props) {
  return (
    <div
      className={`p-small lg:p-middle gap-small flex items-center justify-between rounded border border-transparent transition-colors ${
        isTarget ? "bg-app-bg/60" : "hover:border-line bg-app-bg focus-within:border-line"
      }`}
    >
      <input
        placeholder={isTarget ? undefined : "Enter an amount"}
        disabled={isTarget}
        className="px-small h-12 w-full rounded bg-transparent text-base font-thin focus-visible:outline-none disabled:cursor-not-allowed"
      />
      <TokenSelect items={items} value={value} />
    </div>
  );
}
