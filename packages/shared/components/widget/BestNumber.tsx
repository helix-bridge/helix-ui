import type { BlockNumber } from '@polkadot/types/interfaces/runtime';
import { Spin, Tooltip } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { timer } from 'rxjs/internal/observable/timer';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { retry } from 'rxjs/internal/operators/retry';
import { startWith } from 'rxjs/internal/operators/startWith';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { Subscription } from 'rxjs/internal/Subscription';
import { MIDDLE_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { ChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { prettyNumber } from 'shared/utils/helper';

const DURATION = 6000;

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

    if (config.wallets.includes('polkadot')) {
      const api = entrance.polkadot.getInstance(config.provider);

      sub$$ = from(waitUntilConnected(api))
        .pipe(
          mergeMap(() => timer(0, DURATION)),
          takeWhile(() => isMounted && api.isConnected),
          switchMap(() => from(api.derive.chain.bestNumber())),
          startWith(null)
        )
        .subscribe(observer);
    }

    if (config.wallets.includes('metamask')) {
      const web3 = entrance.web3.getInstance(config.provider);

      sub$$ = timer(0, DURATION)
        .pipe(
          takeWhile(() => isMounted),
          switchMap(() => from(web3.getBlockNumber())),
          retry({ count: 10, delay: MIDDLE_DURATION }),
          startWith(null)
        )
        .subscribe(observer);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [config.wallets, config.name, config.provider, isMounted, observer]);

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
