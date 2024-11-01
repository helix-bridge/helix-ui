interface Props {
  className?: string;
  total: number;
  currentPage: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}

export default function Pagination({
  className,
  total,
  currentPage,
  pageSize = 10,
  onChange = () => undefined,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    totalPages > 1 && (
      <div className={`${className} gap-small flex items-center justify-end`}>
        <PageButton page="previous" disabled={currentPage === 0} onClick={() => onChange(currentPage - 1)} />
        {createPageOptions(totalPages, currentPage, onChange)}
        <PageButton page="next" disabled={currentPage + 1 === totalPages} onClick={() => onChange(currentPage + 1)} />
      </div>
    )
  );
}

function PageButton({
  page,
  disabled,
  currentPage,
  onClick,
}: {
  page: number | "previous" | "next" | "more";
  disabled?: boolean;
  currentPage?: number;
  onClick?: () => void;
}) {
  return (
    <button
      className={`rounded-small inline-flex h-8 w-8 items-center justify-center border text-sm font-medium text-white transition disabled:scale-100 disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-60 ${
        page === "more" || page === currentPage ? "hover:cursor-default" : "hover:border-primary active:scale-95"
      } ${page === currentPage ? "border-primary bg-primary" : "bg-component border-transparent"}`}
      onClick={onClick}
      disabled={disabled}
    >
      {page === "more" ? (
        <span>...</span>
      ) : page === "previous" ? (
        <img alt="Previous" width={16} height={16} src="images/pagination/previous-page.svg" />
      ) : page === "next" ? (
        <img alt="Next" width={16} height={16} src="images/pagination/next-page.svg" />
      ) : (
        <span>{page + 1}</span>
      )}
    </button>
  );
}

function createPageOptions(totalPages: number, currentPage: number, onChange: (page: number) => void) {
  const pageNumbers = new Array(totalPages).fill(0).map((_, index) => index);

  if (currentPage < 3 || totalPages - 4 < currentPage) {
    // 0, 1, 2 or totalPages - 3, totalPages - 2, totalPages - 1

    if (totalPages > 8) {
      // 0, 1, 2, 3, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1
      return (
        <>
          {pageNumbers.slice(0, 4).map((p) => (
            <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onChange(p)} />
          ))}
          <PageButton page="more" />
          {pageNumbers.slice(-4).map((p) => (
            <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onChange(p)} />
          ))}
        </>
      );
    } else {
      return pageNumbers
        .slice(0, totalPages)
        .map((p) => <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onChange(p)} />);
    }
  } else {
    // 0, ..., currentPage - 1, currentPage, currentPage + 1, ..., totalPages - 1
    return (
      <>
        <PageButton page={0} currentPage={currentPage} onClick={() => onChange(0)} />
        <PageButton page="more" />
        {pageNumbers.slice(currentPage - 1, currentPage + 2).map((p) => (
          <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onChange(p)} />
        ))}
        <PageButton page="more" />
        <PageButton page={totalPages - 1} currentPage={currentPage} onClick={() => onChange(totalPages - 1)} />
      </>
    );
  }
}
