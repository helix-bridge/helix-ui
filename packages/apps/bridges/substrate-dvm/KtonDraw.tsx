import { LoadingOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Button, message, notification } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import BN from 'bn.js';
import { upperCase } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { of } from 'rxjs';
import { MIDDLE_DURATION } from 'shared/config/constant';
import { useIsMountedOperator } from 'shared/hooks';
import {
  CrossChainDirection,
  CrossToken,
  DarwiniaAsset,
  DVMChainConfig,
  PolkadotChainConfig,
  Token,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { fromWei, toWei } from 'shared/utils/helper';
import { createTxWorkflow, genEthereumTransactionObs } from 'shared/utils/tx';
import { useApi, useTx } from '../../providers';
import { WITHDRAW_ADDRESS } from './config';

interface KtonDrawProps {
  direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>;
  kton: Token | undefined;
  pendingClaimAmount: BN;
  onSuccess?: () => void;
}

export function KtonDraw({ direction, kton, pendingClaimAmount, onSuccess }: KtonDrawProps) {
  const {
    departure,
    departureConnection: { accounts },
  } = useApi();
  const [isDisable, setIsDisable] = useState(false);
  const { observer } = useTx();
  const { t } = useTranslation();
  const { takeWhileIsMounted } = useIsMountedOperator();
  const account = useMemo(() => accounts[0]?.address ?? '', [accounts]);

  const claimKton = useCallback(() => {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
    const amount = toWei({ value: pendingClaimAmount, decimals: 9 });
    const result = web3.eth.abi.encodeParameters(['address', 'uint256'], [direction.from.address, amount]);
    const position = 2;
    const data = '0x3225da29' + result.slice(position); // transfer_and_call(address, unit256)
    const gas = 100000;

    const obs = genEthereumTransactionObs({
      from: account,
      to: WITHDRAW_ADDRESS,
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
  }, [account, direction.from, observer, onSuccess, pendingClaimAmount, t, takeWhileIsMounted]);

  if (pendingClaimAmount.lte(BN_ZERO)) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl border border-opacity-20 border-white bg-${departure?.name}`}
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
