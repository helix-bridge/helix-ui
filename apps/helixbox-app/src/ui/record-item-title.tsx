import Tooltip from "./tooltip";

export function RecordItemTitle({ text, tips }: { text: string; tips?: string }) {
  return (
    <div className="gap-small flex w-52 items-center justify-start">
      <span className="text-sm font-extrabold">{text}</span>
      {tips ? (
        <Tooltip content={tips} className="shrink-0" contentClassName="max-w-[15rem] lg:max-w-xs">
          <img width={16} height={16} alt="Info" src="images/info.svg" />
        </Tooltip>
      ) : null}
    </div>
  );
}
