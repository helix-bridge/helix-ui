import Image from "next/image";
import Tooltip from "../ui/tooltip";

export function RecordLabel({ text, tips }: { text: string; tips?: string }) {
  return (
    <div className="gap-small flex w-52 items-center justify-start">
      {!!tips && (
        <Tooltip content={<span className="text-xs font-normal text-white">{tips}</span>} className="shrink-0">
          <Image width={16} height={16} alt="Info" src="/images/info.svg" />
        </Tooltip>
      )}
      <span className="text-sm font-medium text-white">{text}</span>
    </div>
  );
}
