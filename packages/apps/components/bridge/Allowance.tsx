import { EyeInvisibleFilled } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CrossChainDirection, CrossChainPayload } from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, approveToken, createTxWorkflow, getAllowance } from 'shared/utils/tx';
import { useAfterTx } from '../../hooks';
import { useAccount, useTx } from '../../providers';
import { ApproveConfirm } from '../tx/ApproveConfirm';
import { ApproveDone } from '../tx/ApproveSuccess';

type ApproveValue = CrossChainPayload;

interface AllowanceProps {
  direction: CrossChainDirection;
  spender: string;
  tokenAddress: string;
  onChange?: (allowance: BN | null) => void;
}

export function Allowance({ direction, onChange, spender, tokenAddress }: AllowanceProps) {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { afterApprove } = useAfterTx<ApproveValue>();
  const { observer } = useTx();
  const [allowance, setAllowance] = useState<BN | null>(null);

  const query = useCallback(
    async (address: string, sender: string, token: string) => {
      if ([address, sender, token].some((item) => !item)) {
        console.log(
          `⚠️ Missing parameters to  query allowance: address(${address}), spender(${sender}), tokenAddress(${token})`
        );
        return;
      }

      const result = await getAllowance(address, sender, token, direction.from.meta.provider);

      if (onChange) {
        onChange(result);
      }

      setAllowance(result);
    },
    [direction.from.meta.provider, onChange]
  );

  useEffect(() => {
    query(account, spender, tokenAddress);
  }, [account, query, spender, tokenAddress]);

  if (!allowance) {
    return <EyeInvisibleFilled />;
  }

  if (allowance.lt(new BN(toWei({ value: direction.from.amount })))) {
    return (
      <Tooltip title={t('Exceed the authorized amount, click to authorize more amount, or reduce the transfer amount')}>
        <Button
          onClick={() => {
            const value = { sender: account, direction };
            const { sender } = value;
            const beforeTx = applyModalObs({
              content: <ApproveConfirm value={value} />,
            });
            const txObs = approveToken({
              sender,
              spender,
              tokenAddress,
            });

            return createTxWorkflow(
              beforeTx,
              txObs,
              afterApprove(ApproveDone, {
                payload: value as ApproveValue,
                onDisappear: () => query(account, spender, tokenAddress),
              })
            ).subscribe(observer);
          }}
          size="small"
        >
          approve
        </Button>
      </Tooltip>
    );
  }

  return (
    <Typography.Text className="capitalize">
      <span>
        {fromWei({ value: allowance }, largeNumber, (num: string) => prettyNumber(num, { ignoreZeroDecimal: true }))}
      </span>
      <span className="capitalize ml-1">{direction.from.symbol}</span>
    </Typography.Text>
  );
}
