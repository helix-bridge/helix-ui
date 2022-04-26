import { EthereumChainConfig, Network, PolkadotChainConfig, RecordComponentProps } from '@helix/shared/model';
import { getLegalName, verticesToChainConfig } from '@helix/shared/utils';
import { encodeAddress } from '@polkadot//util-crypto';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Progresses, ProgressProps, State } from '../../components/record/Progress';
import { Record } from '../../components/record/Record';
import {
  Ethereum2DarwiniaRecord as E2DRecordType,
  Ethereum2DarwiniaRedeemRecord,
  Ethereum2DarwiniaRingBurnRecord,
} from './model';

export function Ethereum2DarwiniaRecord({
  record,
  departure,
  arrival,
}: RecordComponentProps<
  E2DRecordType & Partial<Ethereum2DarwiniaRingBurnRecord & Ethereum2DarwiniaRedeemRecord> & { isGenesis?: boolean },
  EthereumChainConfig,
  PolkadotChainConfig
>) {
  const { chain, amount, currency, target, blockTimestamp, isRelayed, tx, darwiniaTx, isGenesis } = record;
  const { t } = useTranslation();
  const decimal = useMemo(() => arrival?.ss58Prefix ?? 0, [arrival]);

  const from = useMemo(
    () =>
      isGenesis
        ? verticesToChainConfig({
            network: getLegalName(chain) as Network,
            mode: 'native',
          })
        : departure,
    [chain, departure, isGenesis]
  );

  const transactionSend: ProgressProps = useMemo(
    () => ({
      title: t('{{chain}} Sent', { chain: from?.name }),
      steps: [{ state: State.completed }],
      network: from,
    }),
    [from, t]
  );

  const originLocked: ProgressProps = useMemo(
    () => ({
      title: t('{{chain}} Confirmed', { chain: from?.name }),
      steps: [{ state: tx ? State.completed : State.pending, txHash: tx }],
      network: from,
    }),
    [from, t, tx]
  );

  const relayerConfirmed: ProgressProps = useMemo(
    () => ({
      title: t('ChainRelay Confirmed'),
      steps: [{ state: isRelayed ? State.completed : State.pending }],
      icon: 'relayer.svg',
      network: null,
    }),
    [isRelayed, t]
  );

  const targetConfirmed: ProgressProps = useMemo(
    () => ({
      title: t('{{chain}} Confirmed', { chain: arrival?.name }),
      steps: [{ state: darwiniaTx || isGenesis ? State.completed : State.pending, txHash: darwiniaTx }],
      network: arrival,
    }),
    [arrival, darwiniaTx, isGenesis, t]
  );

  const progresses = isGenesis
    ? [transactionSend, originLocked, targetConfirmed]
    : [transactionSend, originLocked, relayerConfirmed, targetConfirmed];

  return (
    <Record
      departure={departure}
      arrival={arrival}
      blockTimestamp={blockTimestamp}
      recipient={!target || target.startsWith('0x') ? target : encodeAddress('0x' + target, decimal)}
      assets={[{ amount, deposit: JSON.parse((record as { deposit: string }).deposit || '{}'), currency }]}
      items={progresses}
    >
      <Progresses items={progresses}></Progresses>
    </Record>
  );
}
