import { PaperClipOutlined } from '@ant-design/icons';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { getChainConfig } from '../../utils/network';

export function Refunded({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const { fromChain } = record;
  const dep = getChainConfig(fromChain);
  const [e2dHeight, e2dIndex] = record.responseTxHash.split('-');

  return (
    <div className="flex gap-1 justify-end items-center">
      <span className="text-helix-yellow">{t('Refunded')}</span>
      <ExplorerLink
        network={dep}
        txHash={record.responseTxHash}
        extrinsic={e2dHeight && e2dIndex ? { height: e2dHeight, index: e2dIndex } : undefined}
      >
        <PaperClipOutlined className="hover:text-pangolin-main cursor-pointer" />
      </ExplorerLink>
    </div>
  );
}
