import { Button, Tooltip } from 'antd';
import { formatDistance, fromUnixTime } from 'date-fns';
import { useRouter } from 'next/router';
import { CrossChainState } from 'shared/components/widget/CrossChainStatus';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { Icon } from 'shared/components/widget/Icon';
import { HelixHistoryRecord } from 'shared/model';
import { isDVM2Substrate, isS2S, isSubstrateDVM } from 'shared/utils/bridge';
import { fromWei, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig, getDisplayName, toVertices } from 'shared/utils/network';
import { Path } from '../../config';

// eslint-disable-next-line complexity
export function Record({ record }: { record: HelixHistoryRecord }) {
  const { fromChain, sender, recipient, toChain } = record;
  const departure = toVertices(fromChain);
  const arrival = toVertices(toChain);
  const fromConfig = getChainConfig(departure);
  const toConfig = getChainConfig(arrival);
  const fromAccount = revertAccount(sender, fromConfig);
  const toAccount = revertAccount(recipient, toConfig);
  const router = useRouter();

  const amount = fromWei({ value: record.amount, decimals: isDVM2Substrate(departure, arrival) ? 18 : 9 }, (val) =>
    prettyNumber(val, { ignoreZeroDecimal: true })
  );

  const tokenName = !record.token.startsWith('0x')
    ? record.token
    : `${departure.mode === 'dvm' ? 'x' : ''}${fromConfig?.isTest ? 'O' : ''}RING`;

  return (
    <>
      <span className="justify-self-start ellipse-two-lines">
        {formatDistance(fromUnixTime(record.startTime), new Date(new Date().toUTCString()), {
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

      <span>{tokenName}</span>

      <Tooltip title={amount}>
        <span className="justify-self-center max-w-full truncate">
          {prettyNumber(amount, { decimal: 3, ignoreZeroDecimal: true })}
        </span>
      </Tooltip>

      <span className="justify-self-center">
        {fromWei({ value: record.fee, decimals: departure.mode === 'dvm' ? 18 : 9 })}
      </span>

      <span className="justify-self-center capitalize">{record.bridge}</span>

      <div className="flex items-center">
        <CrossChainState value={record.result} />

        <Button
          type="link"
          onClick={() => {
            const from = toVertices(record.fromChain);
            const to = toVertices(record.toChain);
            const radix = 16;
            const paths = isS2S(from, to)
              ? ['s2s', record.laneId + '0x' + Number(record.nonce).toString(radix)]
              : isSubstrateDVM(from, to)
              ? ['s2dvm', record.id]
              : [];

            router.push({
              pathname: `${Path.transaction}/${paths.join('/')}`,
              query: new URLSearchParams({
                from: record.fromChain,
                to: record.toChain,
              }).toString(),
            });
          }}
        >
          <Icon name="view" className="text-xl" />
        </Button>
      </div>
    </>
  );
}
