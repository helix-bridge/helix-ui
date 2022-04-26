import { RecordComponentProps, PolkadotChainConfig, DVMChainConfig } from '@helix/shared/model';
import { isDVM, dvmAddressToAccountId } from '@helix/shared/utils';
import { getUnixTime } from 'date-fns';
import { upperCase } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progresses, ProgressProps, State } from '../../components/record/Progress';
import { Record } from '../../components/record/Record';
import { Substrate2DVMRecord as S2DRecord } from './model';

export function Substrate2DVMRecord({
  departure,
  arrival,
  record,
}: RecordComponentProps<S2DRecord, PolkadotChainConfig, PolkadotChainConfig>) {
  const { t } = useTranslation();

  const symbol = useMemo(() => {
    if (!departure) {
      return '';
    }

    return record.section === 'balances'
      ? (departure as DVMChainConfig).ethereumChain.nativeCurrency.symbol!
      : upperCase(`${departure.name.charAt(0)}kton`);
  }, [departure, record]);

  const chainName = useCallback(
    (config: PolkadotChainConfig) => (isDVM(config) ? `${config?.name} (Smart) ` : config.name),
    []
  );

  const transactionSend = useMemo(
    () => ({
      title: t('{{chain}} Sent', { chain: chainName(departure!) }),
      steps: [{ state: State.completed }],
      network: departure,
    }),
    [chainName, departure, t]
  );

  const originLocked = useMemo(
    () => ({
      title: t('{{chain}} Locked', { chain: chainName(departure!) }),
      steps: [{ state: State.completed }],
      network: departure,
      icon: 'lock.svg',
    }),
    [chainName, departure, t]
  );

  const targetConfirmed = useMemo<ProgressProps>(() => {
    return {
      title: t('{{chain}} Confirmed', { chain: chainName(arrival!) }),
      steps: [{ state: State.completed, blockHash: record.block?.blockHash }],
      network: arrival,
    };
  }, [arrival, chainName, record.block?.blockHash, t]);

  const progresses = [transactionSend, originLocked, targetConfirmed];

  return (
    <Record
      departure={departure}
      arrival={arrival}
      blockTimestamp={getUnixTime(new Date(record.timestamp)) || Date.now()}
      recipient={dvmAddressToAccountId(record.recipientId).toString()}
      assets={[{ amount: record.amount, currency: symbol, decimals: 9 }]}
      items={progresses}
    >
      <Progresses items={progresses} />
    </Record>
  );
}
