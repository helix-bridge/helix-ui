import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import type { Observer } from 'rxjs/internal/types';
import { Tx } from '../../model';
import { waitUntilConnected } from '../connection';

function extrinsicSpy(observer: Observer<Tx>) {
  observer.next({ status: 'signing' });

  // eslint-disable-next-line complexity
  return async (result: SubmittableResult) => {
    if (!result || !result.status) {
      return;
    }

    console.info(
      '%c [ extrinsic status ]-22',
      'font-size:13px; background:pink; color:blue;',
      result.status.toJSON(),
      result
    );

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
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>
) {
  const obs = new Observable((spy: Observer<Tx>) => {
    extrinsic.signAndSend(sender, extrinsicSpy(spy)).catch((error) => spy.error({ status: 'error', error }));
  });

  const web3FromAddress = import('@polkadot/extension-dapp').then((res) => res.web3FromAddress(sender));

  return from(web3FromAddress).pipe(
    tap((injector) => api.setSigner(injector.signer)),
    switchMap(() => from(waitUntilConnected(api))),
    switchMap(() => obs)
  );
}
