import { Spin } from 'antd';
import Bignumber from 'bignumber.js';
import { format, secondsToMilliseconds, subMilliseconds } from 'date-fns';
import request from 'graphql-request';
import { last, orderBy } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';
import { Subscription } from 'rxjs';
import { DATE_FORMAT } from 'shared/config/constant';
import { ENDPOINT, isFormalChain, isTestChain } from 'shared/config/env';
import { SYSTEM_ChAIN_CONFIGURATIONS } from 'shared/config/network';
import { ChainConfig, DailyStatistic } from 'shared/model';
import { gqlName, prettyNumber, rxGet } from 'shared/utils/helper';
import { chainConfigs } from 'shared/utils/network';
import { BarChart, Statistic } from '../components/dashboard/BarChart';
import { Chain } from '../components/dashboard/Chain';
import { Statistics } from '../components/dashboard/Statistics';
import { STATISTICS_QUERY, TIMEPAST } from '../config';

interface StatisticTotal {
  volume: Bignumber;
  transactions: Bignumber;
}

interface ChainStatistic {
  chain: ChainConfig;
  data: DailyStatistic[];
}

// @see response of: https://api.coingecko.com/api/v3/coins/list
type CoinIds = 'darwinia-crab-network' | 'darwinia-network-native-token';

const configs = SYSTEM_ChAIN_CONFIGURATIONS.filter((config) => config.isTest === isTestChain);

const initialPrices = Object.fromEntries(configs.map((item) => [item.name, { usd: 1 }]));

const queryStatistics = async () => {
  const statistics = await Promise.all([
    ...configs.map((chain) =>
      request(ENDPOINT, STATISTICS_QUERY, { timepast: TIMEPAST, chain: chain.name }).then((res) => ({
        chain,
        data: res[gqlName(STATISTICS_QUERY)],
      }))
    ),
    request(ENDPOINT, STATISTICS_QUERY, { timepast: TIMEPAST }).then((res) => ({
      chain: 'all',
      data: res[gqlName(STATISTICS_QUERY)],
    })),
  ]).then((result) => result.filter((item) => item.data.length));

  return {
    chainStatistics: statistics.filter((item) => item.chain !== 'all') as ChainStatistic[],
    dailyStatistics: statistics.find((item) => item.chain === 'all')?.data ?? [],
  };
};

function Page() {
  const { t } = useTranslation('common');
  const [loading] = useState(false);
  const [prices, setPrices] = useState(initialPrices);
  const [chainStatistics, setChainStatistics] = useState<ChainStatistic[]>([]);
  const [dailyStatistics, setDailyStatistics] = useState<DailyStatistic[]>([]);

  const { volume, transactions, transactionsTotal } = useMemo(() => {
    if (!dailyStatistics) {
      return { volume: [], transactions: [], volumeTotal: 0, transactionsTotal: 0 };
    }

    return {
      volume: dailyStatistics
        .map(({ timestamp, dailyVolume }) => [secondsToMilliseconds(+timestamp), +dailyVolume])
        .reverse() as Statistic[],
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
      ? subMilliseconds(new Date(), secondsToMilliseconds(TIMEPAST)).getTime()
      : secondsToMilliseconds(+last(dailyStatistics)!.timestamp);

    return format(date, DATE_FORMAT) + ' (+UTC)';
  }, [dailyStatistics]);

  const { volumeRank, transactionsRank, volumeTotal } = useMemo(() => {
    const calcTotal = (key: keyof DailyStatistic) => (acc: Bignumber, cur: DailyStatistic) =>
      acc.plus(new Bignumber(cur[key]));

    const calcVolumeTotal = calcTotal('dailyVolume');
    const calcTransactionsTotal = calcTotal('dailyCount');

    const calcChainTotal: (data: DailyStatistic[], price: number) => StatisticTotal = (data, price) => ({
      volume: data.reduce(calcVolumeTotal, new Bignumber(0)).multipliedBy(new Bignumber(price)),
      transactions: data.reduce(calcTransactionsTotal, new Bignumber(0)),
    });

    const rankSource = chainStatistics.map((item) => ({
      ...item,
      statistic: calcChainTotal(item.data, prices[item.chain.name].usd),
    }));

    const calcRank: (key: keyof StatisticTotal) => { chain: ChainConfig; total: Bignumber }[] = (
      key: keyof StatisticTotal
    ) =>
      orderBy(
        rankSource.map(({ chain, statistic }) => ({ chain, total: statistic[key] })),
        (item) => item.total.toNumber(),
        'desc'
      );

    const volumes = calcRank('volume').map(({ chain, total }) => ({
      chain,
      total: Math.ceil(total.toNumber()),
    }));

    const vTotal = volumes.reduce((acc, cur) => acc.plus(cur.total), new Bignumber(0));

    return {
      volumeRank: volumes
        .map(({ chain, total }) => ({
          chain,
          total: prettyNumber(total),
        }))
        .filter((item) => +item.total > 0),
      volumeTotal: prettyNumber(vTotal),
      transactionsRank: calcRank('transactions')
        .map(({ chain, total }) => ({
          chain,
          total: prettyNumber(total.toString(), { decimal: 0 }),
        }))
        .filter((item) => +item.total > 0),
    };
  }, [prices, chainStatistics]);

  useEffect(() => {
    let sub$$: Subscription;

    if (isFormalChain) {
      sub$$ = rxGet<{ [key in CoinIds]: { usd: number } }>({
        url: 'https://api.coingecko.com/api/v3/simple/price',
        params: { ids: 'darwinia-crab-network,darwinia-network-native-token', vs_currencies: 'usd' },
      }).subscribe((res) => {
        if (res) {
          const { 'darwinia-crab-network': crab, 'darwinia-network-native-token': darwinia } = res;

          setPrices((pre) => ({ ...pre, crab, darwinia }));
        }
      });
    }

    queryStatistics().then((result) => {
      setDailyStatistics(result.dailyStatistics);
      setChainStatistics(result.chainStatistics);
    });

    return () => sub$$?.unsubscribe();
  }, []);

  return (
    <div>
      <Statistics
        titleLeft={t('volume by week')}
        titleRight={t('volume')}
        startTime={startTime}
        total={volumeTotal}
        rank={volumeRank}
        currency="$"
      >
        {loading ? (
          <div className="block relative top-1/3 text-center">
            <Spin />
          </div>
        ) : (
          <BarChart data={volume} name="volume" />
        )}
      </Statistics>

      <Statistics
        titleLeft={t('transactions by week')}
        titleRight={t('transactions')}
        startTime={startTime}
        total={transactionsTotal}
        rank={transactionsRank}
      >
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
