import { useTranslation } from 'next-i18next';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../components/bridge/Bridge';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateDVMBridge } from './utils';

export function DVM2Substrate(
  props: CrossChainComponentProps<SubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>
) {
  const { t } = useTranslation();

  return (
    <Bridge
      {...props}
      tip={t(
        'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
        { type: 'Substrate' }
      )}
    />
  );
}
