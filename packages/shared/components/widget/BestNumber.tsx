import { BlockNumber } from '@polkadot/types/interfaces/runtime';
import { Spin, Tooltip } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { from, mergeMap, retry, startWith, Subscription, switchMap, takeWhile, timer } from 'rxjs';
import { MIDDLE_DURATION } from '@helix/shared/config/constant';
import { useIsMounted } from '@helix/shared/hooks';
import { ChainConfig } from '@helix/shared/model';
import { entrance, isEthereumNetwork, isPolkadotNetwork, prettyNumber, waitUntilConnected } from '@helix/shared/utils';

const duration = 6000;

interface BestNumberProps {
  onChange?: (num: string) => void;
  config: ChainConfig;
  color?: string;
}

function Component({ config, color = '', onChange = (num) => void num }: BestNumberProps) {
  const isMounted = useIsMounted();
  const [bestNumber, setBestNumber] = useState<string | null>(null);

  const observer = useMemo(
    () => ({
      next(num: BlockNumber | number | null) {
        if (num) {
          onChange(num.toString());
          setBestNumber(num.toString());
        }
      },
      error(error: unknown) {
        console.error(error);
      },
      complete() {
        console.log('best number observer completed');
      },
    }),
    [onChange]
  );

  useEffect(() => {
    let sub$$: Subscription;

    if (isPolkadotNetwork(config.name)) {
      const api = entrance.polkadot.getInstance(config.provider.rpc);

      sub$$ = from(waitUntilConnected(api))
        .pipe(
          mergeMap(() => timer(0, duration)),
          takeWhile(() => isMounted && api.isConnected),
          switchMap(() => from(api.derive.chain.bestNumber())),
          startWith(null)
        )
        .subscribe(observer);
    }

    if (isEthereumNetwork(config.name)) {
      const web3 = entrance.web3.getInstance(config.provider.etherscan);

      sub$$ = timer(0, duration)
        .pipe(
          takeWhile(() => isMounted),
          switchMap(() => from(web3.eth.getBlockNumber())),
          retry({ count: 10, delay: MIDDLE_DURATION }),
          startWith(null)
        )
        .subscribe(observer);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [config.name, config.provider.etherscan, config.provider.rpc, isMounted, observer]);

  return (
    <Tooltip title={bestNumber}>
      <div className="max-w-full overflow-hidden flex items-center">
        {bestNumber ? (
          <span className="inline-flex items-center gap-2" style={{ color }}>
            <span>#</span>
            <span>{prettyNumber(bestNumber, { decimal: 0, ignoreZeroDecimal: true })}</span>
          </span>
        ) : (
          <Spin size="small" className="mx-auto" />
        )}
      </div>
    </Tooltip>
  );
}

export const BestNumber = memo(Component);
