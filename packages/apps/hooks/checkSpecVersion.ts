import {
  BridgeState,
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
} from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { useEffect, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';

export function useCheckSpecVersion(
  direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<PolkadotChainConfig | DVMChainConfig>>
): BridgeState & { specVersionOnline: string } {
  const [specVersionOnline, setSpecVersionOnline] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const { to } = direction;

  useEffect(() => {
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
  }, [to.meta.provider]);

  if (checking) {
    return { status: 'pending', reason: 'checking', specVersionOnline: 'unknown' };
  }

  return to.meta.specVersion === +specVersionOnline
    ? { status: 'available', specVersionOnline }
    : {
        status: 'error',
        reason: `The spec version of ${to.name} used here is inconsistent with the on-chain version`,
        specVersionOnline,
      };
}
