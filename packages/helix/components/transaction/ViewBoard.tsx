interface ViewBoardProps {
  title: string;
  count: string | number;
}

export function ViewBoard({ title, count }: ViewBoardProps) {
  return (
    <div className="flex justify-between items-center lg:flex-col lg:gap-4 bg-gray-200 dark:bg-antDark w-full px-4 lg:px-0 py-2 lg:py-4 text-center text-gray-800 dark:text-gray-400">
      <span className="uppercase">{title}</span>
      <span className="text-xl lg:text-4xl">{count}</span>
    </div>
  );
}
