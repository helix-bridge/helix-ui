import { LoadingOutlined } from '@ant-design/icons';
import { MIDDLE_DURATION } from '@helix/shared/config/constant';
import { useIsMountedOperator } from '@helix/shared/hooks';
import {
  CrossChainDirection,
  DarwiniaAsset,
  DVMChainConfig,
  PolkadotChainConfig,
  Token,
  Tx,
} from '@helix/shared/model';
import { createTxWorkflow, entrance, fromWei, genEthereumTransactionObs, toWei } from '@helix/shared/utils';
import { BN_ZERO } from '@polkadot/util';
import { Button, message, notification } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import BN from 'bn.js';
import { upperCase } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { of } from 'rxjs';
import { useApi, useTx } from '../../hooks';

interface KtonDrawProps {
  direction: CrossChainDirection<DVMChainConfig, PolkadotChainConfig>;
  kton: Token | undefined;
  pendingClaimAmount: BN;
  onSuccess?: () => void;
}

export function KtonDraw({ direction, kton, pendingClaimAmount, onSuccess }: KtonDrawProps) {
  const {
    network,
    mainConnection: { accounts },
  } = useApi();
  const [isDisable, setIsDisable] = useState(false);
  const { observer } = useTx();
  const { t } = useTranslation();
  const { takeWhileIsMounted } = useIsMountedOperator();
  const account = useMemo(() => accounts[0]?.address ?? '', [accounts]);

  const claimKton = useCallback(() => {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
    const amount = toWei({ value: pendingClaimAmount, decimals: 9 });
    const result = web3.eth.abi.encodeParameters(['address', 'uint256'], [direction.from.dvm.smartKton, amount]);
    const position = 2;
    const data = '0x3225da29' + result.slice(position);
    const gas = 100000;

    const obs = genEthereumTransactionObs({
      from: account,
      to: direction.from.dvm.smartWithdrawKton,
      data,
      value: '0x00',
      gas,
    });

    const afterObs = (tx: Tx) => () => message.success(<span>{tx.hash}</span>, MIDDLE_DURATION);

    createTxWorkflow(of(true), obs, afterObs)
      .pipe(takeWhileIsMounted())
      .subscribe({
        ...observer,
        error: (err) => {
          notification.error({
            message: (
              <div>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
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
          if (onSuccess) {
            onSuccess();
          }
        },
      });

    setIsDisable(false);
  }, [
    account,
    direction.from.dvm.smartKton,
    direction.from.dvm.smartWithdrawKton,
    observer,
    onSuccess,
    pendingClaimAmount,
    t,
    takeWhileIsMounted,
  ]);

  if (pendingClaimAmount.lte(BN_ZERO)) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl border border-opacity-20 border-white bg-${network?.name}`}
    >
      <div className="flex items-center">
        {isDisable ? (
          <LoadingOutlined className="text-lg mr-4 w-6" style={{ color: '#b7eb8f' }} spin />
        ) : (
          <img src="/image/kton.svg" className="mr-4 w-6" alt="" />
        )}

        <span>
          {t('You have {{amount}} {{ktonName}} to claim', {
            amount: fromWei({ value: pendingClaimAmount, decimals: kton?.decimals ?? 9 }),
            ktonName: upperCase(kton?.symbol ?? DarwiniaAsset.kton),
          })}
        </span>
      </div>

      <Button
        onClick={() => claimKton()}
        disabled={isDisable}
        type="primary"
        className="ml-8"
        style={{ backgroundColor: '#52C41A' }}
      >
        {t('Receive')}
      </Button>
    </div>
  );
}
