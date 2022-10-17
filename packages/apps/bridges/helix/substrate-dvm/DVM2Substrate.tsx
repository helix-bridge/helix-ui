import { useTranslation } from 'react-i18next';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMBridge } from './utils';

export function DVM2Substrate({
  form,
  direction,
  bridge,
}: CrossChainComponentProps<SubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
          { type: 'Substrate' }
        )}
      />

      <CrossChainInfo bridge={bridge} fee={null} direction={direction} hideFee></CrossChainInfo>
    </>
  );
}
