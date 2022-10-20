import { ReloadOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { i18n, Trans } from 'next-i18next';
import { useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { isDVMNetwork, isPolkadotNetwork } from 'shared/utils/network/network';
import { useITranslation } from '../../hooks';
import { TxDoneComponentProps } from '../../model/component';

export function TransferDone({ tx, value, showHistory: destroy }: TxDoneComponentProps) {
  const { t } = useITranslation();
  const scan = useMemo(() => {
    let name = 'Etherscan';

    if (isPolkadotNetwork(value.direction.from.meta) || isDVMNetwork(value.direction.from.meta)) {
      name = 'Subscan';
    } else if (value.direction.from.meta.name === 'polygon') {
      name = 'Polygonscan';
    } else if (value.direction.from.meta.name === 'heco') {
      name = 'subview';
    }

    return name;
  }, [value.direction.from.meta]);

  return (
    <>
      <Divider />

      <div className="flex flex-col items-center">
        <ReloadOutlined className="text-7xl text-helix-blue" />

        <h2>{t('Bridging in progress')}</h2>

        <p>
          <Trans i18nKey="viewTransactionHistory" i18n={i18n?.use(initReactI18next)} className="text-center">
            You can track the transfer progress in the
            <span
              onClick={() => {
                if (destroy) {
                  destroy();
                }
              }}
              className="text-helix-blue cursor-pointer hover:opacity-80"
            >
              transaction detail
            </span>
          </Trans>
        </p>

        <ExplorerLink txHash={tx.hash} network={value.direction.from.meta} className="hidden">
          {t('View in {{scan}} explorer', { scan })}
        </ExplorerLink>
      </div>
    </>
  );
}
