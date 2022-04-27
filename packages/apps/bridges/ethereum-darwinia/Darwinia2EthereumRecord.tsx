import { abi } from 'shared/config/abi';
import { ConnectionStatus, RecordComponentProps } from 'shared/model';
import { connect, entrance, getBridge } from 'shared/utils';
import { BN_ZERO } from '@polkadot/util';
import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, filter, from, iif, map, Observable, of, switchMap, take, tap, zip } from 'rxjs';
import { Progresses, ProgressProps, State } from '../../components/record/Progress';
import { Record } from '../../components/record/Record';
import { useTx } from '../../hooks';
import { Darwinia2EthereumMeta, Darwinia2EthereumRecord as D2ERecord, EthereumDarwiniaBridgeConfig } from './model';
import { claimToken } from './utils';

function isSufficient(
  config: EthereumDarwiniaBridgeConfig,
  tokenType: 'ring' | 'kton',
  amount: BN
): Observable<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const store = config.contracts;
  const contract = new web3.eth.Contract(abi.tokenIssuingABI, store.redeem);
  const limit = from(contract.methods.dailyLimit(store[tokenType]).call() as Promise<string>);
  const toadySpent = from(contract.methods.spentToday(store[tokenType]).call() as Promise<string>);

  return zip([limit, toadySpent]).pipe(map(([total, spent]) => new BN(total).sub(new BN(spent)).gte(amount)));
}

export function Darwinia2EthereumRecord({
  departure,
  arrival,
  record,
}: RecordComponentProps<D2ERecord & { meta: Darwinia2EthereumMeta }>) {
  const { t } = useTranslation();
  const { observer, setTx } = useTx();
  const { blockTimestamp, signatures, target, ringValue, ktonValue, extrinsicIndex, tx } = record;
  const [hash, setHash] = useState(tx);

  const claim = useCallback(
    (monitor) => {
      const {
        signatures: sign,
        ringValue: ring,
        ktonValue: kton,
        mmrIndex,
        mmrRoot,
        blockHeader,
        blockNum,
        blockHash,
        meta,
      } = record;
      setTx({ status: 'sending' });
      monitor(true);

      return connect(arrival!)
        .pipe(
          filter(({ status }) => status === ConnectionStatus.success),
          take(1),
          switchMap((_) => {
            const ringBN = new BN(ring);
            const ktonBN = new BN(kton);
            const bridge = getBridge<EthereumDarwiniaBridgeConfig>([departure!, arrival!]);
            const isRingSufficient = iif(
              () => ringBN.gt(BN_ZERO),
              isSufficient(bridge.config, 'ring', ringBN),
              of(true)
            );
            const isKtonSufficient = iif(
              () => ktonBN.gt(BN_ZERO),
              isSufficient(bridge.config, 'kton', ktonBN),
              of(true)
            );

            return zip(isRingSufficient, isKtonSufficient);
          }),
          tap(([isRingSuf, isKtonSuf]) => {
            if (!isRingSuf) {
              message.warn(t('{{token}} daily limit reached!', { token: 'ring' }));
            }

            if (!isKtonSuf) {
              message.warn(t('{{token}} daily limit reached!', { token: 'kton' }));
            }
          }),
          switchMap(([isRingSuf, isKtonSuf]) =>
            isRingSuf && isKtonSuf
              ? claimToken({
                  direction: { from: departure!, to: arrival! },
                  mmrIndex,
                  mmrRoot,
                  mmrSignatures: sign,
                  blockNumber: blockNum,
                  blockHeaderStr: blockHeader,
                  blockHash,
                  meta,
                })
              : EMPTY
          )
        )
        .subscribe({
          ...observer,
          next: (state) => {
            if (state.status === 'finalized' && state.hash) {
              setHash(state.hash);
            }
            observer.next(state);
          },
          error: (err) => {
            observer.next({ status: 'error', error: err.message });
            monitor(false);
          },
          complete: () => {
            observer.complete();
            monitor(false);
          },
        });
    },
    [arrival, departure, observer, record, setTx, t]
  );

  const transactionSend: ProgressProps = useMemo(
    () => ({
      title: t('{{chain}} Sent', { chain: departure?.name }),
      steps: [{ state: State.completed }],
      network: departure,
    }),
    [departure, t]
  );

  const originLocked: ProgressProps = useMemo(
    () => ({
      title: t('{{chain}} Confirmed', { chain: departure?.name }),
      steps: [
        {
          state: extrinsicIndex ? State.completed : State.pending,
          txHash: extrinsicIndex,
        },
      ],
      network: departure,
    }),
    [departure, extrinsicIndex, t]
  );

  const relayerConfirmed: ProgressProps = useMemo(
    () => ({
      title: t('ChainRelay Confirmed'),
      steps: [
        {
          state: signatures ? State.completed : State.pending,
          mutateState: signatures && !hash ? claim : undefined,
        },
      ],
      icon: 'relayer.svg',
      network: null,
    }),
    [claim, hash, signatures, t]
  );

  const targetConfirmed = useMemo<ProgressProps>(
    () => ({
      title: t('{{chain}} Confirmed', { chain: arrival?.name }),
      steps: [{ state: hash ? State.completed : State.pending, txHash: hash }],
      network: arrival,
    }),
    [arrival, hash, t]
  );

  const progresses = [transactionSend, originLocked, relayerConfirmed, targetConfirmed];

  return (
    <Record
      departure={departure}
      arrival={arrival}
      assets={[
        { amount: ringValue, decimals: 9, currency: departure?.isTest ? 'PRING' : 'RING' },
        { amount: ktonValue, decimals: 9, currency: departure?.isTest ? 'PKTON' : 'KTON' },
      ]}
      recipient={target}
      blockTimestamp={blockTimestamp}
      items={progresses}
    >
      <Progresses items={progresses} />
    </Record>
  );
}
