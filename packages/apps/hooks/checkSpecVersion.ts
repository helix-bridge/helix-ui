import { BridgeState, CrossChainDirection, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { useEffect, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';

export function useCheckSpecVersion(
  direction: CrossChainDirection<
    CrossToken<PolkadotChainConfig | DVMChainConfig>,
    CrossToken<PolkadotChainConfig | DVMChainConfig>
  >
): BridgeState & { specVersionOnline: string } {
  const [specVersionOnline, setSpecVersionOnline] = useState<string>('');
  const { to } = direction;

  useEffect(() => {
    const api = entrance.polkadot.getInstance(to.meta.provider);

    const sub$$ = from(waitUntilConnected(api)).subscribe(() => {
      setSpecVersionOnline(api.runtimeVersion.specVersion.toString());
    });

    return () => sub$$.unsubscribe();
  }, [to.meta.provider]);

  return to.meta.specVersion === +specVersionOnline
    ? { status: 'available', specVersionOnline }
    : {
        status: 'error',
        reason: `The spec version of ${to.name} used here is inconsistent with the on-chain version`,
        specVersionOnline,
      };
}
