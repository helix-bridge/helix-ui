import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORM_CONTROL } from 'shared/config/constant';
import { BridgeConfig, ChainConfig, CrossToken } from 'shared/model';
import { Bridge as Brg } from '../../core/bridge';
import { CrossChainComponentProps } from '../../model/component';
import { useAccount } from '../../providers/account';
import { RecipientItem } from '../form-control/RecipientItem';
import { CrossChainInfo } from '../widget/CrossChainInfo';

export function Bridge({
  allowance,
  bridge,
  dailyLimit,
  direction,
  fee,
  form,
  hideRecipient = false,
  tip,
}: CrossChainComponentProps<
  Brg<BridgeConfig, ChainConfig, ChainConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
> & { hideRecipient?: boolean; tip?: string }) {
  const { t } = useTranslation();
  const { account } = useAccount();

  useEffect(() => {
    if (hideRecipient) {
      form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
    }
  }, [form, account, hideRecipient]);

  return (
    <>
      <div className={hideRecipient ? 'hidden' : ''}>
        <RecipientItem
          form={form}
          direction={direction}
          bridge={bridge}
          extraTip={
            tip ??
            t(
              'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
            )
          }
        />
      </div>

      <CrossChainInfo
        bridge={bridge}
        fee={fee}
        direction={direction}
        dailyLimit={dailyLimit}
        allowance={allowance}
      ></CrossChainInfo>
    </>
  );
}
