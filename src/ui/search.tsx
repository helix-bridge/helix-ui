import Image from "next/image";
import Input from "./input";

interface Props {
  placeholder?: string;
  className?: string;
  value: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export default function Search({ placeholder, className, value, onClear, onChange = () => undefined }: Props) {
  return (
    <div
      className={`normal-input-wrap valid-input-wrap flex items-center justify-between gap-small rounded-medium border-white/20 px-medium py-2 focus-within:border-primary ${className}`}
    >
      <Input
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-small bg-transparent text-sm font-medium text-white"
      />
      {value ? (
        <button
          className="relative h-[20px] w-[20px] shrink-0 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/20 active:scale-95"
          onClick={onClear}
        >
          <Image alt="Close" fill src="/images/close.svg" />
        </button>
      ) : (
        <Image width={20} height={20} alt="Search" src="/images/search.svg" className="shrink-0" />
      )}
    </div>
  );
}
