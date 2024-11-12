import Tooltip from "../../../ui/tooltip";

export default function Title({ title, tips, className }: { title: string; tips?: string; className?: string }) {
  return (
    <div className={`gap-small flex items-center ${className}`}>
      <span className="truncate">{title}</span>
      {tips ? (
        <Tooltip content={tips} className="shrink-0" contentClassName="max-w-[18rem]">
          <img width={16} height={16} alt="Info" src="images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}
