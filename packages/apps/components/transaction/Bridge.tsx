import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { useITranslation } from 'shared/hooks/translation';
import { BridgeCategory, ChainConfig } from 'shared/model';
import { getDisplayName } from '../../utils/network';
import { TransferDescription } from './TransferDescription';

interface BridgeProps {
  from: ChainConfig;
  to: ChainConfig;
  category: BridgeCategory;
  size?: 'small' | 'default';
}

export function Bridge({ from: departure, to: arrival, category }: BridgeProps) {
  const { t } = useITranslation();
  const measure = 40;

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
          <img src={`/image/bridges/${category.toLowerCase()}.png`} className={`w-10 md:w-28`} />
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
