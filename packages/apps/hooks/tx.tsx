import { message, ModalProps } from 'antd';
import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CrossChainPayload, Tx } from 'shared/model';
import { applyModal } from 'shared/utils/tx';
import { TxDoneComponentProps } from '../model/component';
import { usePersonal } from '../providers';

export function useAfterTx<T extends CrossChainPayload>() {
  const { t } = useTranslation();
  const { setIsPersonalHistoryVisible } = usePersonal();

  const afterCrossChain = useCallback(
    (
        Comp: FunctionComponent<TxDoneComponentProps>,
        {
          onDisappear,
          payload,
          ...rest
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear?: (value: T, tx: Tx) => void;
          payload: T;
        }
      ) =>
      (tx: Tx) =>
      () => {
        const { destroy } = applyModal({
          content: <Comp tx={tx} value={payload} />,
          okText: t('History'),
          okButtonProps: {
            size: 'large',
            className: 'w-full',
            style: { margin: 0 },
            onClick: () => {
              destroy();

              setIsPersonalHistoryVisible(true);
            },
          },
          onCancel: () => {
            if (onDisappear) {
              onDisappear(payload, tx);
            }
          },
          ...rest,
        });
      },
    [setIsPersonalHistoryVisible, t]
  );

  const afterApprove = useCallback(
    (
        Comp: FunctionComponent<TxDoneComponentProps>,
        {
          onDisappear,
          payload,
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          payload: T;
        }
      ) =>
      (tx: Tx) =>
      () => {
        message.success({
          content: <Comp tx={tx} value={payload} />,
          onClose: () => onDisappear(payload, tx),
          duration: 5,
          type: 'success',
        });
      },
    []
  );

  return { afterCrossChain, afterApprove };
}
