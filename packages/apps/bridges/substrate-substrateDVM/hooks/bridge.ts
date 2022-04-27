import { BridgeState, CrossChainDirection, PolkadotChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils';
import { useEffect, useState } from 'react';
import { from } from 'rxjs';

export function useBridgeStatus(
  direction: CrossChainDirection<PolkadotChainConfig, PolkadotChainConfig>
): BridgeState & { specVersionOnline: string } {
  const [specVersionOnline, setSpecVersionOnline] = useState<string>('');
  const { to } = direction;

  useEffect(() => {
    const api = entrance.polkadot.getInstance(to.provider);

    const sub$$ = from(waitUntilConnected(api)).subscribe(() => {
      setSpecVersionOnline(api.runtimeVersion.specVersion.toString());
    });

    return () => sub$$.unsubscribe();
  }, [to.provider]);

  return to.specVersion === +specVersionOnline
    ? { status: 'available', specVersionOnline }
    : {
        status: 'error',
        reason: `The spec version of ${to.name} used here is inconsistent with the on-chain version`,
        specVersionOnline,
      };
}
