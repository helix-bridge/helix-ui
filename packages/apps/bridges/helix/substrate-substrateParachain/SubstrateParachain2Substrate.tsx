import { useTranslation } from 'react-i18next';
import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { CrossChainComponentProps } from '../../../model/component';
import { SubstrateSubstrateParachainBridge } from './utils';

export function SubstrateParachain2Substrate({
  form,
  direction,
  bridge,
  fee,
}: CrossChainComponentProps<
  SubstrateSubstrateParachainBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>
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

      <CrossChainInfo bridge={bridge} fee={fee} direction={direction}></CrossChainInfo>
    </>
  );
}
