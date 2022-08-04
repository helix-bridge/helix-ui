import { ArrowRightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { getDisplayName } from 'shared/utils/network';
import { TransferStep } from '../../model/transfer';
import { TransferDescription } from './TransferDescription';

export function TransferDetail({ transfers, amount }: { transfers: TransferStep[]; amount: string }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Token Transfer')}
      tip={t('List of tokens transferred in this cross-chain transaction.')}
    >
      <div className="flex flex-col flex-1 gap-2">
        {transfers.map(({ chain, sender, recipient, token }, index) => (
          <div
            key={[token.name, token.host, index].join('-')}
            className="w-full md:w-2/3 2xl:w-1/2 grid grid-cols-12 items-center"
          >
            <span className="flex items-center gap-2 col-span-3">
              <Logo chain={chain} width={16} height={16} className="w-5 h-5" />
              <span className="truncate">{getDisplayName(chain)}</span>
            </span>

            <span className="grid grid-cols-12 items-center gap-2 col-span-6">
              <Tooltip title={sender}>
                <span className="text-center truncate col-span-5">{sender}</span>
              </Tooltip>

              <ArrowRightOutlined />

              <Tooltip title={recipient}>
                <span className="text-center truncate col-span-5">{recipient}</span>
              </Tooltip>
            </span>

            <span className="flex items-center gap-2 col-span-3">
              <span className="font-bold text-sm">{t('For')}</span>
              <Logo name={token.logo} width={16} height={16} className="w-5 h-5" />
              <span className="whitespace-nowrap">
                {amount} {token.name}
              </span>
            </span>
          </div>
        ))}
      </div>
    </TransferDescription>
  );
}
