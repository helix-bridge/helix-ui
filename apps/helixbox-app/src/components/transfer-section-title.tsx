import Tooltip from "../ui/tooltip";

interface Props {
  text: string;
  tips?: string | JSX.Element;
}

export default function TransferSectionTitle({ text, tips }: Props) {
  return (
    <div className="gap-small inline-flex items-center">
      <span className="text-sm font-normal text-white/50">{text}</span>
      {tips ? (
        <Tooltip content={tips} enabledSafePolygon>
          <img width={14} height={14} alt="Info" src="images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}
