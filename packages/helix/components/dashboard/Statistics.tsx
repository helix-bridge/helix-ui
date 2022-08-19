import { SwapOutlined } from '@ant-design/icons';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig } from 'shared/model';
import { getDisplayName } from 'shared/utils/network';

interface StatisticOverview {
  fromChain: ChainConfig;
  toChain: ChainConfig;
  total: number;
}

interface StatisticsProps {
  titleLeft: string;
  titleRight: string;
  startTime: string;
  total: string | number;
  rank: StatisticOverview[];
  currency?: '$';
}

export function Statistics({
  children,
  startTime,
  total,
  titleLeft,
  titleRight,
  rank,
  currency,
}: PropsWithChildren<StatisticsProps>) {
  const { t } = useTranslation('common');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4 lg:mt-6">
      <div className="lg:col-span-8 flex-1 p-4 bg-gray-200 dark:bg-antDark">
        <span className="uppercase text-xl font-normal">{titleLeft}</span>
        {children}
      </div>

      <div className="lg:col-span-4 bg-gray-200 dark:bg-antDark px-5 py-6">
        <div className="flex justify-between items-center">
          <h3 className="uppercase text-xl font-normal">{titleRight}</h3>
          <span className="text-sm font-normal opacity-50">{t('Since {{time}}', { time: startTime })}</span>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center m-2 md:m-4">
          <h2 className="text-4xl font-normal">
            {currency}
            {total}
          </h2>
          <span className="text-sm font-normal opacity-50 capitalize">
            {t('Total {{title}}', { title: titleRight })}
          </span>
        </div>

        <div className="flex flex-col gap-2 md:gap-4 max-h-40 overflow-y-scroll no-scrollbar">
          <div className="flex justify-between">
            <span className="uppercase text-sm font-normal text-gray-200">
              {t('top {{count}} destination', { count: rank.length })}
            </span>
            <span className="uppercase text-sm font-normal text-gray-200">{titleRight}</span>
          </div>

          {rank.map(({ fromChain, toChain, total: iTotal }) => (
            <div key={fromChain.name + '_' + toChain.name} className="flex justify-between items-center">
              <div className="flex-1 flex justify-between items-center capitalize text-xs font-normal text-gray-200">
                <div className="flex gap-1 items-center w-1/3">
                  <Logo chain={fromChain} width={16} height={16} />
                  <span>{getDisplayName(fromChain)}</span>
                </div>

                <SwapOutlined className="mr-4" />

                <div className="flex-1 flex gap-1 items-center">
                  <Logo chain={toChain} width={16} height={16} />
                  <span>{getDisplayName(toChain)}</span>
                </div>
              </div>
              {/* <Bridge from={fromChain} to={toChain} /> */}

              <span className="uppercase text-sm font-normal text-gray-200 w-1/12 text-right">
                {currency}
                {iTotal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
