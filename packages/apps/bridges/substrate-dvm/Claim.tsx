import { ArrowRightOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Button, Empty, message, notification } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import BN from 'bn.js';
import { getUnixTime } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { from, mergeMap, of } from 'rxjs';
import { Logo } from 'shared/components/widget/Logo';
import { isTestChainOrDevEnv, SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { crabConfig, crabDVMConfig, pangolinConfig } from 'shared/config/network';
import { pangolinDVMConfig } from 'shared/config/network/pangolin-dvm';
import { DVMChainConfig, PolkadotChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { dvmAddressToAccountId, fromWei, isKton, prettyNumber, toWei } from 'shared/utils/helper';
import { getDisplayName } from 'shared/utils/network';
import { createTxWorkflow, genEthereumTransactionObs } from 'shared/utils/tx';
import Web3 from 'web3';
import { HistoryItem } from '../../components/record/HistoryItem';
import { useAccount, useTx } from '../../providers';

/**
 * @deprecated remove after implemented in apps
 */
export function Claim() {
  const { t } = useTranslation();
  const { account } = useAccount();
  const [amount, setAmount] = useState<BN>(BN_ZERO);
  const [claiming, setClaiming] = useState(false);

  const [departure, arrival] = useMemo<[PolkadotChainConfig, DVMChainConfig]>(
    () => (isTestChainOrDevEnv ? [pangolinConfig, pangolinDVMConfig] : [crabConfig, crabDVMConfig]),
    []
  );

  const { observer } = useTx();

  const token = arrival.tokens.find((item) => isKton(item.symbol) && item.type === 'native')!;

  const claim = useCallback(() => {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
    const wei = toWei({ value: amount, decimals: 9 });
    const result = web3.eth.abi.encodeParameters(['address', 'uint256'], [token.address, wei]);
    const position = 2;
    const data = '0x3225da29' + result.slice(position); // transfer_and_call(address, unit256)
    const gas = 100000;

    const obs = genEthereumTransactionObs({
      from: account,
      to: SUBSTRATE_DVM_WITHDRAW,
      data,
      value: '0x00',
      gas,
    });

    const afterObs = (tx: Tx) => () => message.success(<span>{tx.hash}</span>, 10);

    setClaiming(true);

    return createTxWorkflow(of(true), obs, afterObs).subscribe({
      next: observer.next,
      error: (err) => {
        setClaiming(false);
        observer.error(err);
        notification.error({
          message: (
            <div>
              <ErrorBoundary>
                <h3>{t('Claim Failed')}</h3>
                {(err as Record<string, string>).receipt && (
                  <p className="overflow-scroll" style={{ maxHeight: 200 }}>
                    {JSON.stringify((err as Record<string, string>).receipt)}
                  </p>
                )}
              </ErrorBoundary>
            </div>
          ),
        });
      },
      complete: () => {
        setClaiming(false);
        setAmount(BN_ZERO);
      },
    });
  }, [account, amount, observer, t, token.address]);

  useEffect(() => {
    if (!account || !Web3.utils.isAddress(account)) {
      return;
    }

    const api = entrance.polkadot.getInstance(departure.provider);

    const address = dvmAddressToAccountId(account).toHuman();

    const sub$$ = from(waitUntilConnected(api))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pipe(mergeMap(() => from((api.rpc as any).balances.usableBalance(1, address))))
      .subscribe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ktonUsableBalance: any) => {
          const usableBalance: string = ktonUsableBalance.usableBalance.toString();
          const count = Web3.utils.toBN(usableBalance);

          setAmount(count);
        }
      );

    return () => sub$$?.unsubscribe();
  }, [account, departure.provider]);

  return account && Web3.utils.isAddress(account) ? (
    <HistoryItem
      record={{
        result: amount.gt(BN_ZERO) ? 0 : 1,
        startTime: getUnixTime(new Date()),
      }}
      token={{
        ...token,
        amount: fromWei({ value: amount, decimals: 9 }, (value) => prettyNumber(value, { ignoreZeroDecimal: true })),
      }}
      process={
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Logo name={departure.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(departure)}</span>
          </div>

          <ArrowRightOutlined />

          <div className="flex items-center gap-2">
            <Logo name={arrival.logos[0].name} width={14} height={14} />
            <span>{getDisplayName(arrival)}</span>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-center pl-5">
        <Button disabled={!amount.gt(BN_ZERO) || claiming} onClick={claim}>
          {t('Claim')}
        </Button>
      </div>
    </HistoryItem>
  ) : (
    <Empty description={t('Please connect to Metamask')} image={<Logo name="metamask.svg" width={96} height={96} />} />
  );
}
