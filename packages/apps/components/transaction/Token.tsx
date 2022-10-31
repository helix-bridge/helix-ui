import Button from 'antd/lib/button';
import { useTranslation } from 'next-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { HelixHistoryRecord } from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection/connection';
import { isEthereumNetwork } from 'shared/utils/network/network';
import { getDisplayName, getOriginChainConfig } from '../../utils/network';
import { getTokenConfigFromHelixRecord } from '../../utils/record';
import { addToMetamask } from '../../utils/token';
import { TransferDescription } from './TransferDescription';

// eslint-disable-next-line complexity
export function Token({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  if (!record || !isEthereumNetwork(record?.toChain)) {
    return null;
  }

  const token = getTokenConfigFromHelixRecord(record, 'recvToken');

  if (!token) {
    return (
      <TransferDescription title={t('Token to Receive')} tip={''}>
        <span className="text-helix-red">
          {t('Failed to get token information by symbol {{recvToken}} on {{chain}}', {
            ...record,
            chain: getDisplayName(record.toChain),
          })}
        </span>
      </TransferDescription>
    );
  }

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
            const config = getOriginChainConfig(record.fromChain);

            isMetamaskChainConsistent(config).subscribe(() => {
              addToMetamask(token);
            });
          }}
        >
          {t('Add to metamask')}
        </Button>
      </div>
    </TransferDescription>
  );
}
