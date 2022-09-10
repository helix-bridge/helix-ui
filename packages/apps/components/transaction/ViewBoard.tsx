import { prettyNumber } from 'shared/utils/helper/balance';

interface ViewBoardProps {
  title: string;
  count: string | number;
}

export function ViewBoard({ title, count }: ViewBoardProps) {
  return (
    <div className="flex justify-between items-center lg:flex-col lg:gap-4 bg-gray-200 dark:bg-antDark w-full px-4 lg:px-0 py-2 lg:py-8 text-center">
      <span className="uppercase text-sm font-normal   text-gray-800 dark:text-gray-300">{title}</span>
      <span className="text-xl lg:text-4xl font-normal text-gray-800 dark:text-white">
        {prettyNumber(count, { ignoreZeroDecimal: true })}
      </span>
    </div>
  );
}
