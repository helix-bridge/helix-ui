import { CheckCircleFilled } from '@ant-design/icons';
import { upperFirst } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { NETWORK_LIGHT_THEME } from 'shared/config/theme';
import { CrossChainAsset, Network, PolkadotChainConfig, Token, TxSuccessComponentProps } from 'shared/model';
import { convertToSS58, getDisplayName, isEthereumNetwork, isPolkadotNetwork } from 'shared/utils';
import { IDescription } from '../widget/IDescription';

function Detail({ amount, asset }: CrossChainAsset<string | Token>) {
  return (
    <div>
      <span>{amount}</span>
      <span className="ml-4">{typeof asset === 'string' ? asset : asset?.symbol}</span>
    </div>
  );
}

export function TransferSuccess({ tx, value, hashType = 'txHash' }: TxSuccessComponentProps) {
  const { t } = useTranslation();
  const color = NETWORK_LIGHT_THEME[value.direction.from.meta.name as Network]['@project-main-bg'];
  const linkProps = { [hashType]: tx.hash };

  const sender = useMemo(() => {
    const { meta } = value.direction.from;

    return isPolkadotNetwork(meta) && meta.mode === 'native'
      ? convertToSS58(value.sender, (meta as PolkadotChainConfig).ss58Prefix)
      : value.sender;
  }, [value]);

  return (
    <>
      <IDescription
        title={t('{{chain}} Network Address', { chain: getDisplayName(value.direction.from.meta) })}
        content={sender}
        icon={<CheckCircleFilled style={{ color }} className="text-2xl" />}
      ></IDescription>

      <IDescription
        title={t('{{chain}} Network Address', { chain: upperFirst(getDisplayName(value.direction.to.meta)) })}
        content={value.recipient}
        icon={<CheckCircleFilled style={{ color }} className="text-2xl" />}
      ></IDescription>

      <IDescription
        title={t('Details')}
        content={<Detail amount={value.direction.from.amount} asset={value.direction.from} />}
        icon={<CheckCircleFilled className="text-2xl" style={{ color }} />}
      ></IDescription>

      <p className="my-6">
        {t('The transaction has been sent, please check the transfer progress in the cross-chain history.')}
      </p>

      <SubscanLink {...linkProps} network={value.direction.from.meta}>
        {t('View in {{scan}} explorer', {
          scan: isEthereumNetwork(value.direction.from.meta) ? 'Etherscan' : 'Subscan',
        })}
      </SubscanLink>
    </>
  );
}
