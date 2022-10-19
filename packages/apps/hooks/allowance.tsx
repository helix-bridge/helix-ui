import { BN } from '@polkadot/util';
import { message } from 'antd';
import { useCallback, useState } from 'react';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { useITranslation } from 'shared/hooks/translation';
import type { CrossChainDirection } from 'shared/model';
import { applyModalObs, approveToken, createTxWorkflow, getAllowance } from 'shared/utils/tx';
import { ApproveConfirm } from '../components/tx/ApproveConfirm';
import { ApproveDone } from '../components/tx/ApproveSuccess';
import { AllowancePayload } from '../model/allowance';
import type { CrossChainPayload } from '../model/tx';
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
    async ({ spender, tokenAddress, provider }: AllowancePayload) => {
      if ([account, spender, tokenAddress].some((item) => !item)) {
        console.log(
          `⚠️ Missing parameters to  query allowance: address(${account}), spender(${spender}), tokenAddress(${tokenAddress})`
        );
        setAllowance(null);
        return;
      }

      const result = await getAllowance(account, spender, tokenAddress, provider ?? direction.from.meta.provider);

      setAllowance(result);
    },
    [account, direction.from.meta.provider]
  );

  const approve = useCallback(
    (payload: AllowancePayload) => {
      const value = { sender: account, direction };
      const { sender } = value;
      const beforeTx = applyModalObs({
        title: <h3 className="text-center mb-4">{t('Approve')}</h3>,
        content: <ApproveConfirm value={value} />,
      });
      const { spender, tokenAddress, gas, gasPrice } = payload;
      const options = gas || gasPrice ? { sendOptions: { gas, gasPrice } } : {};
      const txObs = approveToken({ sender, spender, tokenAddress, ...options });

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
      ).subscribe({
        ...observer,
        complete() {
          observer.complete();
          queryAllowance(payload);
        },
      });
    },
    [account, afterApprove, direction, matched, observer, queryAllowance, t]
  );

  return { approve, allowance, queryAllowance };
}
