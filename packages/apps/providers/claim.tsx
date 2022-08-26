import { BN_ZERO } from '@polkadot/util';
import { message } from 'antd';
import BN from 'bn.js';
import { createContext, useCallback, useContext, useState } from 'react';
import { filter, take, switchMap, iif, of, zip, tap, EMPTY, from, map, Observable, Subscription } from 'rxjs';
import { abi } from 'shared/config/abi';
import { ICamelCaseKeys, HelixHistoryRecord, ConnectionStatus } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { connect, entrance } from 'shared/utils/connection';
import { getChainConfig } from 'shared/utils/network';
import { getAllowance } from 'shared/utils/tx';
import {
  Darwinia2EthereumRecord,
  Darwinia2EthereumHistoryRes,
  EthereumDarwiniaBridgeConfig,
} from '../bridges/helix/ethereum-darwinia/model';
import { claimToken } from '../bridges/helix/ethereum-darwinia/utils';
import { useITranslation } from '../hooks';
import { useTx } from './tx';

interface Claimed {
  id: string;
  hash: string;
}

interface ClaimCtx {
  isClaiming: boolean;
  claim: (
    record: ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>,
    meta: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'>
  ) => Subscription;
  claimedList: Claimed[];
  refundedList: Claimed[];
  onRefundSuccess: (data: Claimed) => void;
}

function isSufficient(config: EthereumDarwiniaBridgeConfig, tokenAddress: string, amount: BN): Observable<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.tokenIssuingABI, config.contracts.issuing);
  const limit = from(contract.methods.dailyLimit(tokenAddress).call() as Promise<string>);
  const toadySpent = from(contract.methods.spentToday(tokenAddress).call() as Promise<string>);

  return zip([limit, toadySpent]).pipe(map(([total, spent]) => new BN(total).sub(new BN(spent)).gte(amount)));
}

export const ClaimContext = createContext<ClaimCtx | null>(null);

export const ClaimProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useITranslation();
  const { observer, setTx } = useTx();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedList, setClaimedList] = useState<Claimed[]>([]);
  const [refundedList, setRefundedList] = useState<Claimed[]>([]);

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
          switchMap((connection) => {
            const ringBN = new BN(ring);
            const ktonBN = new BN(kton);
            const bridge = getBridge<EthereumDarwiniaBridgeConfig>([departure, arrival]);
            const [{ address: ringAddress }, { address: ktonAddress }] = arrival.tokens; // FIXME: Token order on ethereum and ropsten must be 0 for ring, 1 for kton;
            const activeAccount = connection.accounts[0]?.address;
            let tokenAddress = ringBN.gt(BN_ZERO) ? ringAddress : '';

            if (ktonBN.gt(BN_ZERO)) {
              tokenAddress = ktonAddress;
            }

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
            const isAllowanceSufficient = iif(
              () => !activeAccount || !tokenAddress,
              of(false),
              from(getAllowance(activeAccount, bridge.config.contracts.backing, tokenAddress, arrival.provider)).pipe(
                map((allowance) => !!allowance && allowance.gte(tokenAddress === ringAddress ? ringBN : ktonBN))
              )
            );

            return zip(isRingSufficient, isKtonSufficient, isAllowanceSufficient);
          }),
          tap(([isRingSuf, isKtonSuf, isAllowanceSufficient]) => {
            if (!isRingSuf) {
              message.warn(t('{{token}} daily limit reached!', { token: 'ring' }));
            }

            if (!isKtonSuf) {
              message.warn(t('{{token}} daily limit reached!', { token: 'kton' }));
            }

            if (!isAllowanceSufficient) {
              message.warn(t('RING or KTON allowance is insufficient, approve more first!'));
            }
          }),
          switchMap(([isRingSuf, isKtonSuf, isAllowanceSuf]) =>
            isRingSuf && isKtonSuf && isAllowanceSuf
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

  return (
    <ClaimContext.Provider
      value={{
        claimedList,
        claim,
        isClaiming,
        refundedList,
        onRefundSuccess: (data) => setRefundedList((pre) => [...pre, data]),
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaim = () => useContext(ClaimContext) as Exclude<ClaimCtx, null>;
