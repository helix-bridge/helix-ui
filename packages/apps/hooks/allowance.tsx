import { message } from 'antd';
import BN from 'bn.js';
import { useState, useCallback } from 'react';
import { EMPTY } from 'rxjs';
import { CrossChainDirection, CrossChainPayload } from 'shared/model';
import { getAllowance, applyModalObs, approveToken, createTxWorkflow } from 'shared/utils/tx';
import { useITranslation } from 'shared/hooks/translation';
import { ApproveConfirm } from '../components/tx/ApproveConfirm';
import { ApproveDone } from '../components/tx/ApproveSuccess';
import { useAccount, useTx, useWallet } from '../providers';
import { useAfterTx } from './tx';

type ApproveValue = CrossChainPayload;

export function useAllowance(direction: CrossChainDirection) {
  const { t } = useITranslation();
  const { account } = useAccount();
  const { afterApprove } = useAfterTx<ApproveValue>();
  const { observer } = useTx();
  const [allowance, setAllowance] = useState<BN | null>(null);
  const { matched } = useWallet();

  const queryAllowance = useCallback(
    async ({ spender, tokenAddress }: { spender: string; tokenAddress: string }) => {
      if ([account, spender, tokenAddress].some((item) => !item)) {
        console.log(
          `⚠️ Missing parameters to  query allowance: address(${account}), spender(${spender}), tokenAddress(${tokenAddress})`
        );
        return;
      }

      const result = await getAllowance(account, spender, tokenAddress, direction.from.meta.provider);

      console.log('🚀 ~ file: allowance.tsx ~ line 33 ~ result', result?.toString());

      setAllowance(result);
    },
    [account, direction.from.meta.provider]
  );

  const approve = (payload: { spender: string; tokenAddress: string }) => {
    const value = { sender: account, direction };
    const { sender } = value;
    const beforeTx = applyModalObs({
      title: <h3 className="text-center mb-4">{t('Approve')}</h3>,
      content: <ApproveConfirm value={value} />,
    });
    const txObs = approveToken({ sender, ...payload });

    if (!matched) {
      message.error(t('Wrong Network'));
      return EMPTY.subscribe();
    }

    return createTxWorkflow(
      beforeTx,
      txObs,
      afterApprove(ApproveDone, {
        payload: value as ApproveValue,
        onDisappear: () => queryAllowance(payload),
      })
    ).subscribe(observer);
  };

  return { approve, allowance, queryAllowance };
}
