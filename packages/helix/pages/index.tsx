import { Spin } from 'antd';
import Bignumber from 'bignumber.js';
import { format, secondsToMilliseconds, subMilliseconds } from 'date-fns';
import { last, omit, orderBy } from 'lodash';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useState } from 'react';
import { DATE_FORMAT } from '@helix/shared/config/constant';
import {
  crabConfig,
  darwiniaConfig,
  ethereumConfig,
  pangolinConfig,
  pangoroConfig,
  ropstenConfig,
} from '@helix/shared/config/network';
import { TIMEPAST, useDailyStatistic } from '@helix/shared/hooks';
import { ChainConfig, DailyStatistic } from '@helix/shared/model';
import { fromWei, prettyNumber, rxGet } from '@helix/shared/utils';
import { Statistics } from '../components/dashboard/Statistics';
import { Chain, ChainProps } from '../components/dashboard/Chain';
import { BarChart, Statistic } from '../components/dashboard/BarChart';

interface StatisticTotal {
  volume: Bignumber;
  transactions: Bignumber;
}

// @see response of: https://api.coingecko.com/api/v3/coins/list
type CoinIds = 'darwinia-crab-network' | 'darwinia-network-native-token';

const chains: ChainProps[] = [
  ethereumConfig,
  darwiniaConfig,
  crabConfig,
  ropstenConfig,
  omit(pangolinConfig, 'dvm'),
  pangolinConfig,
  pangoroConfig,
];

function Page() {
  const { t } = useTranslation('common');
  const { data: dailyStatistic, loading } = useDailyStatistic();
  const { data: crabStatistic } = useDailyStatistic('crab');
  const { data: darwiniaStatistic } = useDailyStatistic('darwinia');
  const [prices, setPrices] = useState({ crab: { usd: 1 }, darwinia: { usd: 1 } });

  const { volume, transactions, transactionsTotal } = useMemo(() => {
    if (!dailyStatistic) {
      return { volume: [], transactions: [], volumeTotal: 0, transactionsTotal: 0 };
    }

    const { dailyStatistics } = dailyStatistic;

    return {
      volume: dailyStatistics
        .map(({ id, dailyVolume }) => [secondsToMilliseconds(+id), +fromWei({ value: dailyVolume, unit: 'gwei' })])
        .reverse() as Statistic[],
      transactions: dailyStatistics
        .map(({ id, dailyCount }) => [secondsToMilliseconds(+id), dailyCount])
        .reverse() as Statistic[],
      transactionsTotal: prettyNumber(
        dailyStatistics.reduce((acc, cur) => acc.plus(new Bignumber(cur.dailyCount)), new Bignumber(0)),
        { decimal: 0 }
      ),
    };
  }, [dailyStatistic]);

  const startTime = useMemo(() => {
    const date = !dailyStatistic?.dailyStatistics?.length
      ? subMilliseconds(new Date(), secondsToMilliseconds(TIMEPAST)).getTime()
      : secondsToMilliseconds(+last(dailyStatistic!.dailyStatistics)!.id);

    return format(date, DATE_FORMAT) + ' (+UTC)';
  }, [dailyStatistic]);

  const { volumeRank, transactionsRank, volumeTotal } = useMemo(() => {
    const calcTotal = (key: keyof DailyStatistic) => (acc: Bignumber, cur: DailyStatistic) =>
      acc.plus(new Bignumber(cur[key]));

    const calcVolumeTotal = calcTotal('dailyVolume');
    const calcTransactionsTotal = calcTotal('dailyCount');

    const calcChainTotal: (data: DailyStatistic[], price: number) => StatisticTotal = (data, price) => ({
      volume: data.reduce(calcVolumeTotal, new Bignumber(0)).multipliedBy(new Bignumber(price)),
      transactions: data.reduce(calcTransactionsTotal, new Bignumber(0)),
    });

    const rankSource = [
      { chain: crabConfig, statistic: calcChainTotal(crabStatistic?.dailyStatistics || [], prices.crab.usd) },
      {
        chain: darwiniaConfig,
        statistic: calcChainTotal(darwiniaStatistic?.dailyStatistics || [], prices.darwinia.usd),
      },
    ];

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
      // Great than the actual total because of fromWei does not support float number;
      total: fromWei({ value: Math.ceil(total.toNumber()), unit: 'gwei' }),
    }));

    const vTotal = volumes.reduce((acc, cur) => acc.plus(cur.total), new Bignumber(0));

    return {
      volumeRank: volumes.map(({ chain, total }) => ({
        chain,
        total: prettyNumber(total),
      })),
      volumeTotal: prettyNumber(vTotal),
      transactionsRank: calcRank('transactions').map(({ chain, total }) => ({
        chain,
        total: prettyNumber(total.toString(), { decimal: 0 }),
      })),
    };
  }, [crabStatistic?.dailyStatistics, darwiniaStatistic?.dailyStatistics, prices.crab.usd, prices.darwinia.usd]);

  useEffect(() => {
    const sub$$ = rxGet<{ [key in CoinIds]: { usd: number } }>({
      url: 'https://api.coingecko.com/api/v3/simple/price',
      params: { ids: 'darwinia-crab-network,darwinia-network-native-token', vs_currencies: 'usd' },
    }).subscribe((res) => {
      if (res) {
        const { 'darwinia-crab-network': crab, 'darwinia-network-native-token': darwinia } = res;

        setPrices({ crab, darwinia });
      }
    });

    return () => sub$$.unsubscribe();
  }, []);

  return (
    <div>
      <Statistics title={t('volumes')} startTime={startTime} total={volumeTotal} rank={volumeRank} currency="usd">
        {loading ? (
          <div className="block relative top-1/3 text-center">
            <Spin />
          </div>
        ) : (
          <BarChart data={volume} name="volume" />
        )}
      </Statistics>

      <Statistics title="transactions" startTime={startTime} total={transactionsTotal} rank={transactionsRank}>
        {loading ? (
          <div className="block relative top-1/3 text-center">
            <Spin />
          </div>
        ) : (
          <BarChart data={transactions} name="transactions" />
        )}
      </Statistics>

      <div className="gap-4 lg:gap-6">
        <h2 className="uppercase my-6">{t<string>('chains')}</h2>

        <div className="grid md:grid-cols-4 gap-4 lg:gap-6">
          {chains.map((item, index) => (
            <Chain {...item} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
