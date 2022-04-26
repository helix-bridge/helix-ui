import { CheckCircleFilled } from '@ant-design/icons';
import { SubscanLink } from '@helix/shared/components/widget/SubscanLink';
import { NETWORK_LIGHT_THEME } from '@helix/shared/config/theme';
import {
  CrossChainAsset,
  MappingToken,
  TxSuccessComponentProps,
  CrossChainPayload,
  Network,
} from '@helix/shared/model';
import { isPolkadotNetwork, getNetworkMode, convertToSS58, fromWei, isEthereumNetwork } from '@helix/shared/utils';
import { getDisplayName } from 'next/dist/shared/lib/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IDescription } from '../widget/IDescription';

function Detail({ amount, asset }: CrossChainAsset<string | MappingToken>) {
  return (
    <div>
      <span>{amount}</span>
      <span className="ml-4">{typeof asset === 'string' ? asset : asset?.symbol}</span>
    </div>
  );
}

// eslint-disable-next-line complexity
export function TransferSuccess({
  tx,
  value,
  hashType = 'txHash',
  decimals = 18,
}: TxSuccessComponentProps<CrossChainPayload>) {
  const { t } = useTranslation();
  const color = NETWORK_LIGHT_THEME[value.direction.from?.name as Network]['@project-main-bg'];
  const linkProps = { [hashType]: tx.hash };
  const sender = useMemo(
    () =>
      isPolkadotNetwork(value.direction.from.name) && getNetworkMode(value.direction.from) !== 'dvm'
        ? convertToSS58(value.sender, value.direction.from.ss58Prefix)
        : value.sender,
    [value]
  );

  return (
    <>
      <IDescription
        title={
          <span className="capitalize">
            {t('{{network}} Network Address', { network: getDisplayName(value.direction.from) })}
          </span>
        }
        content={sender}
        icon={<CheckCircleFilled style={{ color }} className="text-2xl" />}
      ></IDescription>

      <IDescription
        title={
          <span className="capitalize">
            {t('{{network}} Network Address', { network: getDisplayName(value.direction.to) })}
          </span>
        }
        content={value.recipient}
        icon={<CheckCircleFilled style={{ color }} className="text-2xl" />}
      ></IDescription>

      <IDescription
        title={t('Details')}
        content={
          (value.asset && value.amount && <Detail {...value} amount={fromWei({ value: value.amount, decimals })} />) ||
          (value.assets &&
            value.assets.map((item: CrossChainPayload) => (
              <Detail
                {...item}
                amount={item.decimals ? fromWei({ value: item.amount, decimals: item.decimals }) : item.amount}
                key={item.asset}
              />
            )))
        }
        icon={<CheckCircleFilled className="text-2xl" style={{ color }} />}
      ></IDescription>

      <p className="my-6">
        {t('The transaction has been sent, please check the transfer progress in the cross-chain history.')}
      </p>

      <SubscanLink {...linkProps} network={value.direction.from?.name as Network}>
        {t('View in {{scan}} explorer', {
          scan: isEthereumNetwork(value.direction.from?.name) ? 'Etherscan' : 'Subscan',
        })}
      </SubscanLink>
    </>
  );
}
