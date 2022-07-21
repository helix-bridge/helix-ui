import { BN_ZERO } from '@polkadot/util';
import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useState } from 'react';
import { EMPTY, filter, from, iif, map, Observable, of, switchMap, take, tap, zip } from 'rxjs';
import { abi } from 'shared/config/abi';
import { ConnectionStatus, HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { connect, entrance } from 'shared/utils/connection';
import { getChainConfig } from 'shared/utils/network';
import { useITranslation } from '../../../hooks';
import { useTx } from '../../../providers';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord, EthereumDarwiniaBridgeConfig } from '../model';
import { claimToken } from '../utils';

function isSufficient(config: EthereumDarwiniaBridgeConfig, tokenAddress: string, amount: BN): Observable<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.tokenIssuingABI, config.contracts.redeem);
  const limit = from(contract.methods.dailyLimit(tokenAddress).call() as Promise<string>);
  const toadySpent = from(contract.methods.spentToday(tokenAddress).call() as Promise<string>);

  return zip([limit, toadySpent]).pipe(map(([total, spent]) => new BN(total).sub(new BN(spent)).gte(amount)));
}

export function useDarwinia2EthereumClaim() {
  const { t } = useITranslation();
  const { observer, setTx } = useTx();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedList, setClaimedList] = useState<{ id: string; hash: string }[]>([]);

  const claim = useCallback(
    (
      record: ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>,
      meta: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'>
    ) => {
      const {
        signatures: sign,
        ringValue: ring,
        ktonValue: kton,
        mmrIndex,
        mmrRoot,
        blockHeader,
        blockNum,
        blockHash,
        fromChain,
        toChain,
      } = record;
      setTx({ status: 'sending' });
      setIsClaiming(true);
      const departure = getChainConfig(fromChain);
      const arrival = getChainConfig(toChain);

      return connect(arrival)
        .pipe(
          filter(({ status }) => status === ConnectionStatus.success),
          take(1),
          switchMap((_) => {
            const ringBN = new BN(ring);
            const ktonBN = new BN(kton);
            const bridge = getBridge<EthereumDarwiniaBridgeConfig>([departure, arrival]);
            const [{ address: ringAddress }, { address: ktonAddress }] = arrival.tokens; // FIXME: Token order on ethereum and ropsten must be 0 for ring, 1 for kton;
            const isRingSufficient = iif(
              () => ringBN.gt(BN_ZERO),
              isSufficient(bridge.config, ringAddress, ringBN),
              of(true)
            );
            const isKtonSufficient = iif(
              () => ktonBN.gt(BN_ZERO),
              isSufficient(bridge.config, ktonAddress, ktonBN),
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
              setClaimedList((pre) => [...pre, { id: record.id, hash: state.hash! }]);
            }
            observer.next(state);
          },
          error: (err) => {
            observer.next({ status: 'error', error: err });
            setIsClaiming(false);
          },
          complete: () => {
            observer.complete();
            setIsClaiming(false);
          },
        });
    },
    [observer, setTx, t]
  );

  return { claim, isClaiming, claimedList };
}
