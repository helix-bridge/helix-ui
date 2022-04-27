import { CloudDownloadOutlined } from '@ant-design/icons';
import { RecordComponentProps, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { convertToSS58 } from 'shared/utils';
import { Tooltip } from 'antd';
import { getUnixTime } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progresses, ProgressProps, State } from '../../components/record/Progress';
import { Record } from '../../components/record/Record';
import { DVM2SubstrateRecord as D2SRecord } from './model';

// eslint-disable-next-line complexity
export function DVM2SubstrateRecord({
  departure,
  arrival,
  record,
}: RecordComponentProps<D2SRecord, DVMChainConfig, PolkadotChainConfig>) {
  const { t } = useTranslation();
  const { recipientId } = record;
  // recipientId: 0x64766d3a000000000000008809f9b3acef1da309f49b5ab97a4c0faa64e6ae49
  // eslint-disable-next-line no-magic-numbers
  const isClaim = recipientId?.includes(departure?.dvm.smartKton.slice(2).toLowerCase() ?? '');

  const symbol = useMemo(() => {
    if (!departure) {
      return '';
    }

    return /kton/i.test(record.method) ? 'WCKTON' : (departure as DVMChainConfig).ethereumChain.nativeCurrency.symbol!;
  }, [departure, record]);

  const chainName = useCallback(
    (config: PolkadotChainConfig) => (config.mode === 'dvm' ? `${config?.name} (Smart) ` : config.name),
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

  const targetClaimed = useMemo<ProgressProps>(
    () => ({
      title: t('{{chain}} Claimed', { chain: chainName(departure!) }),
      steps: [{ state: State.completed, blockHash: record.block?.blockHash }],
      network: arrival,
    }),
    [arrival, chainName, departure, record.block?.blockHash, t]
  );

  const progresses = isClaim ? [transactionSend, targetClaimed] : [transactionSend, originLocked, targetConfirmed];

  return (
    <div className="relative">
      <Record
        departure={departure}
        arrival={arrival}
        blockTimestamp={getUnixTime(new Date(record.timestamp)) || Date.now()}
        recipient={isClaim ? record.senderId : convertToSS58(record.recipientId, departure!.ss58Prefix)}
        assets={[{ amount: record.amount, currency: symbol }]}
        items={progresses}
      >
        <Progresses items={progresses} />
      </Record>

      {isClaim && (
        <Tooltip title={t('Claimed')}>
          <CloudDownloadOutlined className="absolute right-4 top-2 text-green-400" />
        </Tooltip>
      )}
    </div>
  );
}
