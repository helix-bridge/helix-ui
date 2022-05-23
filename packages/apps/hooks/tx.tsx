import { message, ModalProps } from 'antd';
import { useRouter } from 'next/router';
import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SHORT_DURATION } from 'shared/config/constant';
import { CrossChainPayload, Tx, TxDoneComponentProps, TxHashType } from 'shared/model';
import { isDarwinia2Ethereum, isEthereum2Darwinia } from 'shared/utils/bridge';
import { applyModal } from 'shared/utils/tx';

export function useAfterTx<T extends CrossChainPayload>() {
  const { t } = useTranslation();
  const router = useRouter();

  const afterCrossChain = useCallback(
    (
        Comp: FunctionComponent<TxDoneComponentProps>,
        {
          onDisappear,
          hashType = 'txHash',
          payload,
          ...rest
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          payload: T;
        }
      ) =>
      (tx: Tx) =>
      () => {
        const { destroy } = applyModal({
          content: <Comp tx={tx} value={payload} hashType={hashType} />,
          okText: t('Cross-chain history'),
          okButtonProps: {
            size: 'large',
            className: 'w-full',
            style: { margin: 0 },
            onClick: () => {
              destroy();

              const { from, to } = payload.direction;

              if (isDarwinia2Ethereum(from.meta, to.meta) || isEthereum2Darwinia(from.meta, to.meta)) {
                router.push('/history');
              } else {
                window.open('https://helixbridge.app/zh/transaction', '_blank');
              }
            },
          },
          onCancel: () => onDisappear(payload, tx),
          ...rest,
        });
      },
    [router, t]
  );

  const afterApprove = useCallback(
    (
        Comp: FunctionComponent<TxDoneComponentProps>,
        {
          onDisappear,
          payload,
          hashType = 'txHash',
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          payload: T;
        }
      ) =>
      (tx: Tx) =>
      () => {
        message.success({
          content: <Comp tx={tx} value={payload} hashType={hashType} />,
          onClose: () => onDisappear(payload, tx),
          duration: SHORT_DURATION,
          type: 'success',
        });
      },
    []
  );

  return { afterCrossChain, afterApprove };
}
