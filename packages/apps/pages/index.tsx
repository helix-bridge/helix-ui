import { Spin } from 'antd';
import Bignumber from 'bignumber.js';
import { format, secondsToMilliseconds, subMilliseconds } from 'date-fns';
import request from 'graphql-request';
import chain from 'lodash/chain';
import last from 'lodash/last';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';
import { ENDPOINT } from 'shared/config/env';
import { DATE_FORMAT } from 'shared/config/constant';
import { DailyStatistic, Network } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { gqlName, prettyNumber } from 'shared/utils/helper';
import { chainConfigs, getChainConfig } from 'shared/utils/network';
import { BarChart, Statistic } from '../components/dashboard/BarChart';
import { Chain } from '../components/dashboard/Chain';
import { Statistics } from '../components/dashboard/Statistics';
import { STATISTICS_QUERY, TIMEPAST } from '../config';

function Page() {
  const { t } = useTranslation('common');
  const [loading] = useState(false);
  const [dailyStatistics, setDailyStatistics] = useState<DailyStatistic[]>([]);

  const { transactions, transactionsTotal } = useMemo(() => {
    if (!dailyStatistics) {
      return { volume: [], transactions: [], volumeTotal: 0, transactionsTotal: 0 };
    }

    return {
      transactions: dailyStatistics
        .map(({ timestamp, dailyCount }) => [secondsToMilliseconds(+timestamp), +dailyCount])
        .reverse() as Statistic[],
      transactionsTotal: prettyNumber(
        dailyStatistics.reduce((acc, cur) => acc.plus(new Bignumber(cur.dailyCount)), new Bignumber(0)),
        { decimal: 0 }
      ),
    };
  }, [dailyStatistics]);

  const startTime = useMemo(() => {
    const date = !dailyStatistics?.length
      ? subMilliseconds(Date.now(), secondsToMilliseconds(TIMEPAST)).getTime()
      : secondsToMilliseconds(+last(dailyStatistics)!.timestamp);

    return format(date, DATE_FORMAT) + ' (+UTC)';
  }, [dailyStatistics]);

  const transactionsRank = useMemo(() => {
    return chain(dailyStatistics)
      .reduce((acc, cur) => {
        const bridge = getBridge([cur.fromChain as Network, cur.toChain as Network]);
        const key = bridge.issue.join('_');

        acc[key] = (acc[key] ?? 0) + Number(cur.dailyCount);

        return acc;
      }, {} as { [key: string]: number })
      .entries()
      .map((item) => {
        const [fromChain, toChain] = item[0].split('_') as [Network, Network];
        const total = item[1];

        return { fromChain: getChainConfig(fromChain), toChain: getChainConfig(toChain), total };
      })
      .orderBy(['total'], ['desc'])
      .value();
  }, [dailyStatistics]);

  useEffect(() => {
    request(ENDPOINT, STATISTICS_QUERY, { timepast: TIMEPAST }).then((res) => {
      const data = res[gqlName(STATISTICS_QUERY)] as DailyStatistic[];

      setDailyStatistics(data);
    });
  }, []);

  return (
    <div>
      <Statistics title={t('transactions')} startTime={startTime} total={transactionsTotal} rank={transactionsRank}>
        {loading ? (
          <div className="block relative top-1/3 text-center">
            <Spin />
          </div>
        ) : (
          <BarChart data={transactions} name="transactions" />
        )}
      </Statistics>

      <div className="gap-4 lg:gap-6">
        <h2 className="uppercase text-xl font-normal my-6">{t<string>('chains')}</h2>

        <div className="grid md:grid-cols-4 gap-4 lg:gap-6">
          {chainConfigs.map((item, index) => (
            <Chain {...item} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async ({ locale, res }: GetServerSidePropsContext) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=100');

  return {
    props: {
      ...translations,
    },
  };
};

export default Page;
