import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { useAccount } from '../../../providers';
import { SubstrateDVMEthereumBridge } from './utils/bridge';

export function SubstrateDVM2Ethereum({
  form,
  fee,
  direction,
  bridge,
}: CrossChainComponentProps<SubstrateDVMEthereumBridge, CrossToken<EthereumChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { account } = useAccount();

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  return (
    <>
      <div className="hidden">
        <RecipientItem
          form={form}
          direction={direction}
          bridge={bridge}
          extraTip={t(
            'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
          )}
        />
      </div>

      <CrossChainInfo bridge={bridge} fee={fee} direction={direction}></CrossChainInfo>
    </>
  );
}
