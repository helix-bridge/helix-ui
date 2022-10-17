import { useTranslation } from 'next-i18next';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { fromWei, largeNumber, prettyNumber } from 'shared/utils/helper/balance';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateDVMBridge } from './utils/bridge';

export function SubstrateDVM2Substrate({
  allowance,
  form,
  bridge,
  direction,
  fee,
}: CrossChainComponentProps<SubstrateSubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();

  return (
    <>
      <RecipientItem
        form={form}
        bridge={bridge}
        direction={direction}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={fee}
        direction={direction}
        extra={[
          {
            name: t('Allowance'),
            content: (
              <span className="capitalize">
                <span>
                  {fromWei({ value: allowance }, largeNumber, (num: string) =>
                    prettyNumber(num, { ignoreZeroDecimal: true })
                  )}
                </span>
                <span className="capitalize ml-1">{direction.from.symbol}</span>
              </span>
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
