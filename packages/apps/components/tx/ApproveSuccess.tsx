import { SubscanLink } from '@helix/shared/components/widget/SubscanLink';
import { CrossChainParty, Network, TxSuccessComponentProps } from '@helix/shared/model';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

export function ApproveSuccess({ value, tx }: TxSuccessComponentProps<CrossChainParty>) {
  const { t } = useTranslation();

  return (
    <>
      <Typography.Text>{t('Approve Success {{account}}', { account: value.sender })}</Typography.Text>
      <SubscanLink txHash={tx.hash} network={value.direction.from?.name as Network} className="ml-4">
        {t('View in {{scan}} explorer', { scan: 'Etherscan' })}
      </SubscanLink>
    </>
  );
}
