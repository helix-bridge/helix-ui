import { message, ModalProps } from 'antd';
import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tx } from 'shared/model/tx';
import { applyModal } from 'shared/utils/tx';
import { TxDoneComponentProps } from '../model/component';
import type { CrossChainPayload } from '../model/tx';
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
          content: (
            <Comp
              tx={tx}
              value={payload}
              showHistory={() => {
                setIsPersonalHistoryVisible(true);
                destroy();
              }}
            />
          ),
          okButtonProps: { hidden: true },
          cancelButtonProps: { hidden: true },
          title: <h3 className="mb-0">{t('Transfer Submitted')}</h3>,
          closable: true,
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
