import { useTranslation } from 'react-i18next';
import { CrossToken, ParachainChainConfig } from 'shared/model';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { CrabParachainMoonriverBridge } from './utils';

export function Moonriver2CrabParachain({
  form,
  direction,
  bridge,
}: CrossChainComponentProps<
  CrabParachainMoonriverBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>) {
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

      <CrossChainInfo bridge={bridge} direction={direction}></CrossChainInfo>
    </>
  );
}
