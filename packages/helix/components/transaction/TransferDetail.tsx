import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { Logo } from 'shared/components/widget/Logo';
import { ChainConfig, TokenWithBridgesInfo } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function TransferDetail({
  transfers,
  amount,
}: {
  transfers: { chain: ChainConfig; from: string; to: string; token: TokenWithBridgesInfo }[];
  amount: string;
}) {
  const { t } = useTranslation();
  return (
    <TransferDescription
      title={t('Token Transfer')}
      tip={t('List of tokens transferred in this cross-chain transaction.')}
    >
      <div className="flex flex-col gap-2">
        {transfers.map(({ chain, from, to, token }) => (
          <div key={token.name} className="flex items-center gap-2">
            <Logo chain={chain} width={16} height={16} className="w-5" />
            <span>{t('From')}</span>
            <span className="w-32 text-center truncate">{from}</span>
            <span>{t('To')}</span>
            <span className="w-32 text-center truncate">{to}</span>
            <span>{t('For')}</span>
            <Image src={`/image/${token.logo}`} width={16} height={16} className="w-5" />
            <span>
              {amount} {token.name}
            </span>
          </div>
        ))}
      </div>
    </TransferDescription>
  );
}
