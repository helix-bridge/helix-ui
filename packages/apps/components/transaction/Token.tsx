import Button from 'antd/lib/button';
import { useTranslation } from 'next-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { HelixHistoryRecord } from 'shared/model';
import { addAsset } from 'shared/utils/connection';
import { isEthereumNetwork } from 'shared/utils/network/network';
import { getTokenConfigFromHelixRecord } from '../../utils/record';
import { TransferDescription } from './TransferDescription';

// eslint-disable-next-line complexity
export function Token({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  if (!record || !isEthereumNetwork(record?.toChain)) {
    return null;
  }

  const token = getTokenConfigFromHelixRecord(record);

  if (!token.address) {
    return null;
  }

  return (
    <TransferDescription title={t('Token to Receive')} tip={''}>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <TextWithCopy>{token.address}</TextWithCopy>
        <Logo name={token.logo} width={18} height={18} />
        <span>{token.symbol}</span>
        <Button
          size="small"
          onClick={() => {
            addAsset(token);
          }}
        >
          {t('Add to metamask')}
        </Button>
      </div>
    </TransferDescription>
  );
}
