import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { from, Observable, Observer, mergeMap, tap } from 'rxjs';
import { Tx } from '../../model';
import { waitUntilConnected } from '../network';

function extrinsicSpy(observer: Observer<Tx>) {
  observer.next({ status: 'signing' });

  // eslint-disable-next-line complexity
  return async (result: SubmittableResult) => {
    if (!result || !result.status) {
      return;
    }

    console.info('%c [ extrinsic status ]-22', 'font-size:13px; background:pink; color:blue;', result.status.toJSON());

    const { error, inBlock, finalized } = result.status.toJSON() as Record<string, string>;

    if (result.status.isBroadcast) {
      observer.next({ status: 'broadcast' });
    }

    if (result.status.isReady) {
      observer.next({ status: 'queued' });
    }

    if (result.status.isInBlock) {
      observer.next({ status: 'inblock', hash: inBlock });
    }

    if (result.status.isFinalized) {
      observer.next({ status: 'finalized', hash: finalized });
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
    waitUntilConnected(api!)
      .then(() => extrinsic.signAndSend(sender, extrinsicSpy(spy)))
      .catch((error) => {
        spy.error({ status: 'error', error });
      });
  });
  const web3FromAddress = import('@polkadot/extension-dapp').then((res) => res.web3FromAddress(sender));

  return from(web3FromAddress).pipe(
    tap((injector) => api.setSigner(injector.signer)),
    mergeMap(() => obs)
  );
}
