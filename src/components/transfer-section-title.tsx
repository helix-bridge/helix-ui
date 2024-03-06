import Tooltip from "@/ui/tooltip";
import Image from "next/image";

interface Props {
  text: string;
  tips?: string | JSX.Element;
}

export default function TransferSectionTitle({ text, tips }: Props) {
  return (
    <div className="inline-flex items-center gap-small px-medium">
      <span className="text-sm font-normal text-white/50">{text}</span>
      {tips ? (
        <Tooltip content={tips}>
          <Image width={16} height={16} alt="Info" src="/images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}
