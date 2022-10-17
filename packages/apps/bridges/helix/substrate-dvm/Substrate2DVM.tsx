import { useTranslation } from 'react-i18next';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMBridge } from './utils';

export function Substrate2DVM({
  form,
  direction,
  bridge,
}: CrossChainComponentProps<SubstrateDVMBridge, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
        )}
      />

      <CrossChainInfo bridge={bridge} direction={direction} hideFee fee={null}></CrossChainInfo>
    </>
  );
}
