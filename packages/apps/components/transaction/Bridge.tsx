import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig, Network } from 'shared/model';
import { getBridge } from '../../utils/bridge';
import { getChainConfig, getDisplayName } from '../../utils/network';
import { TransferDescription } from './TransferDescription';

interface BridgeProps {
  from?: ChainConfig;
  to?: ChainConfig;
  size?: 'small' | 'default';
}

export function Bridge({ from, to }: BridgeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const measure = 40;

  const [departure, arrival] = useMemo(
    () => [from ?? getChainConfig(router.query.from as Network), to ?? getChainConfig(router.query.to as Network)],
    [from, router.query.from, router.query.to, to]
  );

  const bridge = getBridge([departure, arrival]);

  return (
    <TransferDescription title={t('Transfer Route')} tip="">
      <div className="flex justify-between items-center gap-2 bg-antDark bg-opacity-25">
        <div className="flex items-center gap-2">
          <div>{getDisplayName(departure)}</div>
          <Logo chain={departure} width={measure} height={measure} className="w-5 md:w-10" />
        </div>

        <Icon name="right" />

        <div className="bg-black p-2 px-4 rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/image/bridges/${bridge.category.toLowerCase()}.png`} className={`w-10 md:w-28`} />
        </div>

        <Icon name="right" />

        <div className="flex items-center gap-2">
          <Logo chain={arrival} width={measure} height={measure} className="w-5 md:w-10" />
          <div>{t(getDisplayName(arrival))}</div>
        </div>
      </div>
    </TransferDescription>
  );
}
