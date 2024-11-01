import { useMemo } from "react";

interface Props {
  total: number;
  current: number;
  size?: number;
  onChange?: (page: number) => void;
}

export default function Pagination({ total, current, size = 10, onChange = () => undefined }: Props) {
  const totalPages = Math.ceil(total / size);

  return totalPages > 1 ? (
    <div className="gap-small flex items-center justify-end">
      <Button label="previous" current={current} total={totalPages} onClick={() => onChange(current - 1)} />
      {createPageOptions(current, totalPages, onChange)}
      <Button label="next" current={current} total={totalPages} onClick={() => onChange(current + 1)} />
    </div>
  ) : null;
}

function Button({
  label,
  current,
  total,
  onClick,
}: {
  label: number | "previous" | "next" | "more";
  current: number;
  total: number; // Total pages
  onClick?: () => void;
}) {
  const { disabled, className } = useMemo(() => {
    let className =
      "inline-flex items-center justify-center h-8 min-w-[2rem] px-[2px] rounded-md border text-sm font-normal text-white bg-secondary transition-[opacity,color]";
    let disabled = false;

    if ((label === "next" && current + 1 === total) || (label === "previous" && current === 0)) {
      className += " disabled:cursor-not-allowed disabled:opacity-50 border-white/30";
      disabled = true;
    } else if (label === current) {
      className += " bg-white/10 disabled:cursor-default border-transparent";
      disabled = true;
    } else if (label === "more") {
      className += " opacity-50 disabled:cursor-default border-white/30";
      disabled = true;
    } else {
      className += " opacity-50 hover:opacity-100 border-white/30";
    }
    return { disabled, className };
  }, [label, current, total]);

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {label === "more" ? (
        <span>...</span>
      ) : label === "previous" ? (
        <img alt="Previous page" width={16} height={16} src="images/pagination/previous-page.svg" />
      ) : label === "next" ? (
        <img alt="Next page" width={16} height={16} src="images/pagination/next-page.svg" />
      ) : (
        <span>{label + 1}</span>
      )}
    </button>
  );
}

function createPageOptions(current: number, total: number /* Total pages */, onChange: (page: number) => void) {
  const indexs = new Array(total).fill(0).map((_, index) => index);

  if (current < 3 || total - 4 < current) {
    // 0, 1, 2 or total - 3, total - 2, total - 1

    if (total > 8) {
      // 0, 1, 2, 3, ..., total - 4, total - 3, total - 2, total - 1
      return (
        <>
          {indexs.slice(0, 4).map((i) => (
            <Button key={i} label={i} current={current} total={total} onClick={() => onChange(i)} />
          ))}
          <Button label="more" current={current} total={total} />
          {indexs.slice(-4).map((i) => (
            <Button key={i} label={i} current={current} total={total} onClick={() => onChange(i)} />
          ))}
        </>
      );
    } else {
      return indexs.map((i) => (
        <Button key={i} label={i} current={current} total={total} onClick={() => onChange(i)} />
      ));
    }
  } else {
    // 0, ..., current - 1, current, current + 1, ..., total - 1
    return (
      <>
        <Button label={0} current={current} total={total} onClick={() => onChange(0)} />
        <Button label="more" current={current} total={total} />
        {indexs.slice(current - 1, current + 2).map((i) => (
          <Button key={i} label={i} current={current} total={total} onClick={() => onChange(i)} />
        ))}
        <Button label="more" current={current} total={total} />
        <Button label={total - 1} current={current} total={total} onClick={() => onChange(total - 1)} />
      </>
    );
  }
}
