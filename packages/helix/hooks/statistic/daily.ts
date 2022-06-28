import { Network, DailyStatistic } from 'shared/model';
import { useQuery } from 'graphql-hooks';
import { STATISTICS_QUERY } from '../../config';

// eslint-disable-next-line no-magic-numbers
export const TIMEPAST = 6 * 30 * 24 * 3600;

export function useDailyStatistic(chain?: Network, timepast?: number) {
  const { data, loading, error } = useQuery<{ dailyStatistics: DailyStatistic[] }>(STATISTICS_QUERY, {
    variables: { timepast: timepast ?? TIMEPAST, chain },
  });

  return { data: error ? { dailyStatistics: [] } : data, loading };
}
