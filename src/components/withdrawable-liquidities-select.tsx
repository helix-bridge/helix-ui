import ComponentLoading from "@/ui/component-loading";
import Tooltip from "@/ui/tooltip";
import { formatTime } from "@/utils";

interface Props {
  loading: boolean;
  total: number;
  value: { id: string }[];
  options: { id: string; lastRequestWithdraw: string }[];
  onChange?: (value: { id: string }[]) => void;
  onLoadMore?: () => void;
}

export default function WithdrawableLiquiditiesSelect({
  loading,
  total,
  value,
  options,
  onChange = () => undefined,
  onLoadMore = () => undefined,
}: Props) {
  return (
    <div
      className={`relative max-h-60 rounded-xl bg-app-bg ${
        loading ? "overflow-y-hidden" : "app-scrollbar overflow-y-auto"
      }`}
    >
      <ComponentLoading loading={loading} className="bg-black/30" />

      <div className="flex flex-col py-2">
        {options.length ? (
          options.map((option) => (
            <div key={option.id} className="flex items-center justify-between gap-medium px-large py-2">
              <div className="flex items-center gap-medium">
                <button
                  className={`h-4 w-4 border border-primary transition-[transform,color] hover:scale-105 active:scale-95 ${
                    value.some(({ id }) => id === option.id) ? "bg-primary" : "bg-transparent"
                  }`}
                  onClick={() =>
                    onChange(
                      value.some(({ id }) => id === option.id)
                        ? value.filter(({ id }) => id !== option.id)
                        : value.concat({ id: option.id }),
                    )
                  }
                />
                <a
                  target="_blank"
                  href={`/records/${option.id}`}
                  className="truncate text-base font-medium text-primary hover:underline"
                >
                  {toShortId(option.id)}
                </a>
              </div>
              {option.lastRequestWithdraw.length > 1 ? (
                <Tooltip
                  content={`Last request withdraw at ${formatTime(Number(option.lastRequestWithdraw) * 1000, {
                    compact: true,
                  })}`}
                >
                  <img
                    alt="In progress"
                    width={24}
                    height={24}
                    src="images/notification/progress.svg"
                    className="animate-spin rounded-full"
                    style={{ animationDuration: "3s" }}
                  />
                </Tooltip>
              ) : null}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-small">
            <span className="text-sm font-semibold text-slate-400">No data</span>
          </div>
        )}
      </div>
      {total > options.length ? (
        <button
          onClick={onLoadMore}
          className="w-full rounded-b-medium border-t border-t-white/10 py-2 text-sm font-semibold text-white transition-[transform,color] hover:bg-primary active:translate-y-1"
        >
          Load More
        </button>
      ) : null}
    </div>
  );
}

function toShortId(id: string) {
  return `${id.slice(0, 14)}...${id.slice(-8)}`;
}
