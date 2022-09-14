import { Spin } from 'antd';
import { format, secondsToMilliseconds, subMilliseconds } from 'date-fns';
import { useQuery } from 'graphql-hooks';
import last from 'lodash/last';
import orderBy from 'lodash/orderBy';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { DATE_FORMAT } from 'shared/config/constant';
import { DailyStatistic, Network } from 'shared/model';
import { prettyNumber } from 'shared/utils/helper/balance';
import { gqlName } from 'shared/utils/helper/common';
import { getBridge } from 'utils/bridge';
import { getChainConfig } from 'utils/network';
import { BarChart, Statistic } from '../components/dashboard/BarChart';
import { Statistics } from '../components/dashboard/Statistics';
import { STATISTICS_QUERY, TIMEPAST } from '../config';

const NetworkGraph = dynamic(() => import('../components/NetworkG6'), { ssr: false });

function Page() {
  const { t } = useTranslation('common');
  const [loading] = useState(false);

  const { data: response } = useQuery(STATISTICS_QUERY, {
    variables: { timepast: TIMEPAST },
  });

  const dailyStatistics = useMemo(
    () => (response ? (response[gqlName(STATISTICS_QUERY)] as DailyStatistic[]) : []),
    [response]
  );

  const { transactions, transactionsTotal } = useMemo(() => {
    if (!dailyStatistics) {
      return { volume: [], transactions: [], volumeTotal: 0, transactionsTotal: 0 };
    }

    return {
      transactions: dailyStatistics
        .map(({ timestamp, dailyCount }) => [secondsToMilliseconds(+timestamp), +dailyCount])
        .reverse() as Statistic[],
      transactionsTotal: prettyNumber(
        dailyStatistics.reduce((acc, cur) => acc + Number(cur.dailyCount), 0),
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
    const data = Object.entries(
      dailyStatistics?.reduce((acc, cur) => {
        const bridge = getBridge([cur.fromChain as Network, cur.toChain as Network]);
        const key = bridge.issue.join('_');

        acc[key] = (acc[key] ?? 0) + Number(cur.dailyCount);

        return acc;
      }, {} as { [key: string]: number })
    ).map((item) => {
      const [fromChain, toChain] = item[0].split('_') as [Network, Network];
      const total = item[1];

      return { fromChain: getChainConfig(fromChain), toChain: getChainConfig(toChain), total };
    });

    return orderBy(data, ['total'], ['desc']);
  }, [dailyStatistics]);

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
        <h2 className="uppercase text-xl font-normal my-6">{t<string>('Bridges')}</h2>

        <NetworkGraph />
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
