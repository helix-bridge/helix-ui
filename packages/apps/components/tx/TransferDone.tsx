import { i18n, Trans } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { TxDoneComponentProps } from 'shared/model';
import { isDVMNetwork, isPolkadotNetwork } from 'shared/utils/network';
import { useITranslation } from '../../hooks';

export function TransferDone({ tx, value }: TxDoneComponentProps) {
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
      <div className="flex flex-col items-center px-9 py-20 space-y-6">
        <Image alt="..." src="/image/transfer-done.svg" width={133} height={110} />

        <p>
          <Trans i18nKey="viewTransactionHistory" i18n={i18n?.use(initReactI18next)} className="text-center">
            The transaction has been sent, please check the transfer progress in the {''}
            <Link href="/history">history</Link>
          </Trans>
        </p>

        <ExplorerLink txHash={tx.hash} network={value.direction.from.meta}>
          {t('View in {{scan}} explorer', { scan })}
        </ExplorerLink>
      </div>
    </>
  );
}
