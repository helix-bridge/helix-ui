import Image from "next/image";

interface Props {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onReset?: () => void;
}

export default function SearchInput({ placeholder, className, value, onReset, onChange = () => undefined }: Props) {
  return (
    <div
      className={`gap-small border-line px-middle hover:border-primary focus-within:border-primary flex items-center justify-between rounded border py-2 transition-colors duration-300 ${className}`}
    >
      <input
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-transparent text-sm font-medium text-white focus-visible:outline-none"
      />
      {value ? (
        <button
          className="relative h-[20px] w-[20px] shrink-0 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/20 active:scale-95"
          onClick={onReset}
        >
          <Image alt="Close" fill src="/images/close.svg" />
        </button>
      ) : (
        <Image width={20} height={20} alt="Search" src="/images/search.svg" className="shrink-0" />
      )}
    </div>
  );
}
