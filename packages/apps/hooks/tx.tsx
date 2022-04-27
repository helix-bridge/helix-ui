import { CrossChainPayload, TxSuccessComponentProps, Tx, TxHashType } from 'shared/model';
import { applyModal, isEthereumNetwork, convertToSS58, genHistoryRouteParams } from 'shared/utils';
import { ModalProps, message } from 'antd';
import { useRouter } from 'next/router';
import { FunctionComponent, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TxContext, TxCtx } from '../providers';
import { useApi } from './api';

export const useTx = () => useContext(TxContext) as Exclude<TxCtx, null>;

export function useAfterTx<T extends CrossChainPayload<{ sender: string; recipient?: string }>>() {
  const { t } = useTranslation();
  const router = useRouter();
  const { chain } = useApi();

  const afterCrossChain = useCallback(
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: FunctionComponent<TxSuccessComponentProps<CrossChainPayload<any>>>,
        {
          onDisappear,
          decimals,
          hashType = 'txHash',
          ...rest
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          decimals?: number;
        }
      ) =>
      (value: T) =>
      (tx: Tx) =>
      () => {
        const { destroy } = applyModal({
          content: <Comp tx={tx} value={value} hashType={hashType} decimals={decimals} />,
          okText: t('Cross-chain history'),
          okButtonProps: {
            size: 'large',
            onClick: () => {
              destroy();

              const { from, to } = value.direction;
              const sender =
                isEthereumNetwork(value.direction.from) || from.mode === 'dvm'
                  ? value.sender
                  : convertToSS58(value.sender, +chain.ss58Format);

              router.push(
                '/history' +
                  '?' +
                  genHistoryRouteParams({
                    from: from.name,
                    fMode: from.mode,
                    sender,
                    to: to.name,
                    tMode: to.mode,
                  })
              );
            },
          },
          onCancel: (close) => {
            onDisappear(value, tx);
            close();
          },
          ...rest,
        });
      },
    [chain.ss58Format, router, t]
  );

  const afterApprove = useCallback(
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: FunctionComponent<TxSuccessComponentProps<CrossChainPayload<any>>>,
        {
          onDisappear,
          decimals,
          hashType = 'txHash',
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          decimals?: number;
        }
      ) =>
      (value: T) =>
      (tx: Tx) =>
      () => {
        message.success({
          content: <Comp tx={tx} value={value} hashType={hashType} decimals={decimals} />,
          onClose: onDisappear,
        });
      },
    []
  );

  return { afterCrossChain, afterApprove };
}
