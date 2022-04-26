import { CrossChainState } from '@helix/shared/components/widget/CrossChainStatus';
import { EllipsisMiddle } from '@helix/shared/components/widget/EllipsisMiddle';
import { Substrate2SubstrateRecord } from '@helix/shared/model';
import { fromWei, getChainConfigByName, getDisplayName, prettyNumber, revertAccount } from '@helix/shared/utils';
import { Tooltip } from 'antd';
import { formatDistance, fromUnixTime } from 'date-fns';

export function Record({ record }: { record: Substrate2SubstrateRecord }) {
  const { fromChainMode, fromChain, sender, recipient, toChain, toChainMode } = record;
  const fromConfig = getChainConfigByName(fromChain, fromChainMode);
  const toConfig = getChainConfigByName(toChain, toChainMode);
  const now = new Date().toISOString().split('.')[0];
  const fromAccount = revertAccount(sender, fromChain, fromChainMode);
  const toAccount = revertAccount(recipient, toChain, toChainMode);
  const amount = fromWei({ value: record.amount, decimals: 9 }, prettyNumber);

  return (
    <>
      <span className="justify-self-start ellipse-two-lines">
        {formatDistance(fromUnixTime(record.startTime), new Date(now), {
          includeSeconds: true,
          addSuffix: true,
        })}
      </span>

      <div className="flex flex-col col-span-3 overflow-hidden pl-4 pr-2">
        <Tooltip title={fromAccount}>
          <span className="capitalize">{getDisplayName(fromConfig)}</span>
        </Tooltip>
        <EllipsisMiddle deviation={5} isGrow>
          {fromAccount}
        </EllipsisMiddle>
      </div>

      <div className="flex flex-col col-span-3 overflow-hidden pl-2 pr-4">
        <Tooltip title={toAccount}>
          <span className="capitalize">{getDisplayName(toConfig)}</span>
        </Tooltip>
        <EllipsisMiddle deviation={5} isGrow>
          {toAccount}
        </EllipsisMiddle>
      </div>

      <span>{`${fromChainMode === 'dvm' ? 'x' : ''}${fromConfig?.isTest ? 'O' : ''}RING`}</span>

      <Tooltip title={amount}>
        <span className="justify-self-center max-w-full truncate">{amount}</span>
      </Tooltip>

      <span className="justify-self-center">
        {fromWei({ value: record.fee, decimals: fromChainMode === 'dvm' ? 18 : 9 })}
      </span>

      <span className="justify-self-center capitalize">{record.bridge}</span>
      <CrossChainState value={record.result} />
    </>
  );
}
