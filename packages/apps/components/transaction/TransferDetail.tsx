import { ArrowRightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { getDisplayName } from 'utils/network';
import { TransferStep } from '../../model/transfer';
import { TransferDescription } from './TransferDescription';

export function TransferDetail({ transfers }: { transfers: TransferStep[] }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Token Transfer')}
      tip={t('List of tokens transferred in this cross-chain transaction.')}
    >
      <div className="flex flex-col flex-1 gap-2">
        {transfers.map(({ chain, sender, recipient, token, amount }, index) => (
          <div
            key={[token.name, token.host, index].join('-')}
            className="w-full 2xl:w-3/4 grid grid-cols-12 items-center"
          >
            <span className="flex items-center gap-2 col-span-2">
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

            <span className="flex items-center gap-2 col-span-3 2xl:col-span-4">
              <span className="font-bold text-sm whitespace-nowrap">{t('For')}</span>
              <Logo name={token.logo} width={16} height={16} className="w-5 h-5" />
              <span className="whitespace-nowrap">
                <span>{amount}</span>
                <span className="ml-2">{token.name}</span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </TransferDescription>
  );
}
