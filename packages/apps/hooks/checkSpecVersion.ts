import has from 'lodash/has';
import { useEffect, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { BridgeState, ChainConfig, CrossChainDirection, CrossToken, PolkadotChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { isSubstrateDVM } from '../utils';

export function useCheckSpecVersion(
  direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
): BridgeState & { specVersionOnline: string } {
  const [specVersionOnline, setSpecVersionOnline] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const { to } = direction;
  const needCheck = has(to.meta, 'specVersion') && !isSubstrateDVM(direction.from.host, direction.to.host);

  useEffect(() => {
    if (!needCheck) {
      return;
    }

    const api = entrance.polkadot.getInstance(to.meta.provider);

    setChecking(true);
    const sub$$ = from(waitUntilConnected(api)).subscribe({
      next() {
        setSpecVersionOnline(api.runtimeVersion.specVersion.toString());
      },
      error() {
        setChecking(false);
      },
      complete() {
        setChecking(false);
      },
    });

    return () => sub$$.unsubscribe();
  }, [needCheck, to.meta.provider]);

  if (!needCheck) {
    return { status: 'available', reason: 'do not need to check', specVersionOnline: 'unknown' };
  }

  if (checking) {
    return { status: 'pending', reason: 'checking', specVersionOnline: 'unknown' };
  }

  return (to.meta as PolkadotChainConfig).specVersion === +specVersionOnline
    ? { status: 'available', specVersionOnline }
    : {
        status: 'error',
        reason: `The spec version of ${to.name} used here is inconsistent with the on-chain version`,
        specVersionOnline,
      };
}
