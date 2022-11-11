import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { EMPTY } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import type { Observer } from 'rxjs/internal/types';
import { SupportedWallet, Tx } from '../../model';
import { getPolkadotExtension, PolkadotExtension, polkadotExtensions, waitUntilConnected } from '../connection';

function extrinsicSpy(observer: Observer<Tx>) {
  observer.next({ status: 'signing' });

  // eslint-disable-next-line complexity
  return async (result: SubmittableResult) => {
    if (!result || !result.status) {
      return;
    }

    const { error } = result.status.toJSON() as Record<string, string>;

    if (result.status.isBroadcast) {
      observer.next({ status: 'broadcast' });
    }

    if (result.status.isReady) {
      observer.next({ status: 'queued' });
    }

    if (result.status.isInBlock) {
      observer.next({ status: 'inblock', hash: result.txHash.toString() });
    }

    if (result.status.isFinalized) {
      observer.next({ status: 'finalized', hash: result.txHash.toString() });
      observer.complete();
    }

    if (result.isError) {
      observer.error({ status: 'error', error });
    }
  };
}

export function signAndSendExtrinsic(
  api: ApiPromise,
  sender: string,
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>,
  wallet: SupportedWallet
) {
  const obs = new Observable((spy: Observer<Tx>) => {
    extrinsic.signAndSend(sender, extrinsicSpy(spy)).catch((error) => spy.error({ status: 'error', error }));
  });

  if (!polkadotExtensions.includes(wallet as unknown as never)) {
    console.warn(`Can not sign the extrinsic with the ${wallet}`);
    return EMPTY;
  }

  return from(waitUntilConnected(api)).pipe(
    switchMap(() => from(getPolkadotExtension(wallet as PolkadotExtension))),
    tap((injector) => {
      if (injector) {
        api.setSigner(injector.signer);
      } else {
        console.warn(`Can not find the ${wallet} extension, make sure you have install and enable it.`);
      }
    }),
    switchMap((injector) => (injector ? obs : EMPTY))
  );
}
