import { EyeInvisibleFilled } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import BN from 'bn.js';
import { useTranslation } from 'react-i18next';
import { Observable } from 'rxjs';
import { Bridge, CrossChainDirection, CrossChainPayload, Tx } from 'shared/model';
import {
  AfterTxCreator,
  applyModalObs,
  approveToken,
  createTxWorkflow,
  fromWei,
  getBridge,
  prettyNumber,
  toWei,
} from 'shared/utils';
import { ApproveConfirm } from '../../components/tx/ApproveConfirm';
import { ApproveDone } from '../../components/tx/ApproveSuccess';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount } from '../../providers';
import { EthereumDarwiniaBridgeConfig } from './model';
import { getIssuingAllowance } from './utils';

type ApproveValue = CrossChainPayload;

function createApproveRingTx(value: Pick<ApproveValue, 'direction' | 'sender'>, after: AfterTxCreator): Observable<Tx> {
  const beforeTx = applyModalObs({
    content: <ApproveConfirm value={value} />,
  });

  const { sender, direction } = value;

  const bridge = getBridge<EthereumDarwiniaBridgeConfig>([direction.from.meta, direction.to.meta]);
  const { ring: tokenAddress, issuing: spender } = bridge.config.contracts;

  const txObs = approveToken({
    sender,
    spender,
    tokenAddress,
  });

  return createTxWorkflow(beforeTx, txObs, after);
}

interface AllowanceProps {
  allowance: BN | null;
  direction: CrossChainDirection;
  bridge: Bridge;
  afterAllow: (allowance: BN) => void;
}

export function Allowance({ allowance, direction, afterAllow, bridge }: AllowanceProps) {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { afterApprove } = useAfterTx<ApproveValue>();
  const { observer } = useTx();

  if (!allowance) {
    return <EyeInvisibleFilled />;
  }

  const amount = toWei({ value: direction.from.amount });

  if (allowance.lt(new BN(amount))) {
    return (
      <Tooltip title={t('Exceed the authorized amount, click to authorize more amount, or reduce the transfer amount')}>
        <Button
          onClick={() => {
            const value = { sender: account, direction };

            createApproveRingTx(
              value,
              afterApprove(ApproveDone, {
                onDisappear: () => {
                  const {
                    contracts: { ring, issuing },
                  } = bridge.config as EthereumDarwiniaBridgeConfig;

                  getIssuingAllowance(account, ring, issuing).then((num) => afterAllow(num));
                },
              })(value as CrossChainPayload)
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
      <span>{fromWei({ value: allowance }, prettyNumber)}</span>
      <span className="capitalize ml-1">{direction.from.symbol}</span>
    </Typography.Text>
  );
}
