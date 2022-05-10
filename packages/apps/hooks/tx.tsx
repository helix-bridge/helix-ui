import { message, ModalProps } from 'antd';
import { useRouter } from 'next/router';
import { FunctionComponent, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SHORT_DURATION } from 'shared/config/constant';
import { CrossChainPayload, Tx, TxDoneComponentProps, TxHashType } from 'shared/model';
import { applyModal, convertToSS58, genHistoryRouteParams, isEthereumNetwork } from 'shared/utils';
import { TxContext, TxCtx, useApi } from '../providers';

export const useTx = () => useContext(TxContext) as Exclude<TxCtx, null>;

export function useAfterTx<T extends CrossChainPayload>() {
  const { t } = useTranslation();
  const router = useRouter();
  const { chain } = useApi();

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
              const sender =
                isEthereumNetwork(payload.direction.from.meta) || from.meta.mode === 'dvm'
                  ? payload.sender
                  : convertToSS58(payload.sender, +chain.ss58Format);

              router.push(
                '/history' +
                  '?' +
                  genHistoryRouteParams({
                    from: from.meta.name,
                    fMode: from.meta.mode,
                    sender,
                    to: to.meta.name,
                    tMode: to.meta.mode,
                  })
              );
            },
          },
          onCancel: () => {
            onDisappear(payload, tx);
          },
          ...rest,
        });
      },
    [chain.ss58Format, router, t]
  );

  const afterApprove = useCallback(
    (
        Comp: FunctionComponent<TxDoneComponentProps>,
        {
          onDisappear,
          hashType = 'txHash',
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
        }
      ) =>
      (value: T) =>
      (tx: Tx) =>
      () => {
        message.success({
          content: <Comp tx={tx} value={value} hashType={hashType} />,
          onClose: () => {
            onDisappear(value, tx);
          },
          duration: SHORT_DURATION,
          type: 'success',
        });
      },
    []
  );

  return { afterCrossChain, afterApprove };
}
