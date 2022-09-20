import { BN_ZERO } from '@polkadot/util';
import { message } from 'antd';
import BN from 'bn.js';
import type { BigNumber } from 'ethers';
import { Contract } from 'ethers';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from } from 'rxjs/internal/observable/from';
import { iif } from 'rxjs/internal/observable/iif';
import { of } from 'rxjs/internal/observable/of';
import { zip } from 'rxjs/internal/observable/zip';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { take } from 'rxjs/internal/operators/take';
import { tap } from 'rxjs/internal/operators/tap';
import type { Subscription } from 'rxjs/internal/Subscription';
import { abi } from 'shared/config/abi';
import { ConnectionStatus, HelixHistoryRecord, ICamelCaseKeys, Tx } from 'shared/model';
import { connect, entrance } from 'shared/utils/connection';
import { getAllowance } from 'shared/utils/tx';
import { getBridge } from 'utils/bridge';
import { getChainConfig } from 'utils/network';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  EthereumDarwiniaBridgeConfig,
} from '../bridges/helix/ethereum-darwinia/model';
import { claimToken } from '../bridges/helix/ethereum-darwinia/utils';
import { claim as substrateDVM2EthereumClaim } from '../bridges/helix/substrateDVM-ethereum/utils/tx';
import { useITranslation } from '../hooks';
import { useTx } from './tx';

interface Claimed {
  id: string;
  hash: string;
}

interface ClaimCtx {
  isClaiming: boolean;
  d2eClaim: (
    record: ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>,
    meta: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'>
  ) => Subscription;
  eth2Claim: (record: HelixHistoryRecord) => Subscription;
  claimedList: Claimed[];
  refundedList: Claimed[];
  onRefundSuccess: (data: Claimed) => void;
}

function isSufficient(config: EthereumDarwiniaBridgeConfig, tokenAddress: string, amount: BN): Observable<boolean> {
  const contract = new Contract(config.contracts.issuing, abi.tokenIssuingABI, entrance.web3.currentProvider);
  const limit = from(contract.dailyLimit(tokenAddress) as Promise<BigNumber>);
  const toadySpent = from(contract.spentToday(tokenAddress) as Promise<BigNumber>);

  return zip([limit, toadySpent]).pipe(map(([total, spent]) => total.sub(spent).gte(amount.toString())));
}

export const ClaimContext = createContext<ClaimCtx | null>(null);

export const ClaimProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useITranslation();
  const { observer, setTx } = useTx();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedList, setClaimedList] = useState<Claimed[]>([]);
  const [refundedList, setRefundedList] = useState<Claimed[]>([]);

  const genObserver = useCallback(
    (record: HelixHistoryRecord) => {
      return {
        ...observer,
        next: (state: Tx) => {
          if (state.status === 'finalized' && state.hash) {
            setClaimedList((pre) => [...pre, { id: record.id, hash: state.hash! }]);
          }
          observer.next(state);
        },
        error: (err: unknown) => {
          observer.next({ status: 'error', error: new Error('Some error occurred during contract call') });
          console.error('🚀 ~ file: claim.tsx ~ line 80 ~ ClaimProvider ~ err', err);
          setIsClaiming(false);
        },
        complete: () => {
          observer.complete();
          setIsClaiming(false);
        },
      };
    },
    [observer]
  );

  const d2eClaim = useCallback(
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
        .subscribe(genObserver(record));
    },
    [genObserver, setTx, t]
  );

  const eth2Claim = useCallback(
    (record: HelixHistoryRecord) => substrateDVM2EthereumClaim(record).subscribe(genObserver(record)),
    [genObserver]
  );

  return (
    <ClaimContext.Provider
      value={{
        claimedList,
        d2eClaim,
        eth2Claim,
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
