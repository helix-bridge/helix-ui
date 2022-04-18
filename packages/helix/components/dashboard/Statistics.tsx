import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig } from '@helix/shared/model';
import { getDisplayName, prettyNumber } from '@helix/shared/utils';
import { Logo } from '@helix/shared/components/widget/Logo';

interface ChainStatisticOverview {
  chain: ChainConfig;
  total: string;
}

interface StatisticsProps {
  title: string;
  startTime: string;
  total: string | number;
  rank: ChainStatisticOverview[];
  currency?: string;
}

enum Currency {
  usd = '$',
}

export function Statistics({ children, startTime, total, title, rank, currency }: PropsWithChildren<StatisticsProps>) {
  const { t } = useTranslation('common');
  const currencyIcon = currency && Currency['usd'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4 lg:mt-6">
      <div className="lg:col-span-8 flex-1 p-4 bg-gray-200 dark:bg-antDark">
        <span className="uppercase">{title}</span>
        {children}
      </div>

      <div className="lg:col-span-4 bg-gray-200 dark:bg-antDark px-5 py-6">
        <div className="flex justify-between items-center">
          <h3 className="uppercase">{title}</h3>
          <span className="text-gray-400">{startTime}</span>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center mt-4 mb-2 md:mt-10 md:mb-6">
          <h2 className="text-4xl">
            {currencyIcon}
            {prettyNumber(total)}
          </h2>
          <span className="text-gray-400">
            {t('Total {{title}}', { title })}
            {currency && <span className="uppercase ml-1">({currency})</span>}
          </span>
        </div>

        <div className="flex flex-col gap-2 md:gap-4">
          <div className="flex justify-between">
            <span className="uppercase">{t('top {{count}} destinations', { count: rank.length })}</span>
            <span className="uppercase">{title}</span>
          </div>

          {rank.map(({ chain, total: iTotal }) => (
            <div key={chain.name} className="flex justify-between">
              <div className="flex items-center gap-2">
                <Logo chain={chain} width={24} height={24} />
                <span className="capitalize">{getDisplayName(chain)}</span>
              </div>

              <span className="uppercase">
                {currencyIcon}
                {prettyNumber(iTotal)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
