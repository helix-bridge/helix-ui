import { Modal, ModalFuncProps, ModalProps } from 'antd';
import isFunction from 'lodash/isFunction';
import noop from 'lodash/noop';
import { i18n } from 'next-i18next';
import { initReactI18next, Trans } from 'react-i18next';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { finalize } from 'rxjs/internal/operators/finalize';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import type { Observer } from 'rxjs/internal/types';
import { Icon } from '../../components/widget/Icon';
import { RequiredPartial, Tx } from '../../model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalSpyFn<T = any> = (observer: Observer<T>, closeFn: () => void) => void;

type IModalFuncs = {
  afterDisappear?: ModalSpyFn;
  handleOk?: ModalSpyFn;
  handleCancel?: ModalSpyFn;
};

export const txModalConfig: (props: Partial<ModalFuncProps>) => ModalProps = (props) => ({
  okCancel: true,
  okText: <Trans i18n={i18n?.use(initReactI18next)}>Confirm</Trans>,
  cancelText: <Trans i18n={i18n?.use(initReactI18next)}>Cancel</Trans>,
  closable: false,
  closeIcon: <Icon name="close" />,
  okButtonProps: { size: 'large', className: 'flex-1', style: { margin: 0 } },
  cancelButtonProps: { size: 'large', className: 'flex-1', style: { margin: 0 } },
  width: 620,
  centered: true,
  className: 'confirm-modal',
  icon: null,
  destroyOnClose: true,
  title: (
    <h3 className="mb-0">
      <Trans i18n={i18n?.use(initReactI18next)}>Transfer</Trans>
    </h3>
  ),
  ...props,
});

const { confirm } = Modal;

export function buf2hex(buffer: ArrayBuffer) {
  const pos = -2;
  const radix = 16;

  return '0x' + Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(radix)).slice(pos)).join('');
}

export function applyModal(props: RequiredPartial<ModalFuncProps, 'content'> & IModalFuncs): { destroy: () => void } {
  const config = txModalConfig(props);

  return confirm(config);
}

export function applyModalObs<T = boolean>(
  props: RequiredPartial<ModalFuncProps, 'content'> & IModalFuncs
): Observable<T | boolean> {
  const { handleOk } = props;
  const config = txModalConfig(props);
  const { afterClose, ...others } = config;

  return new Observable((observer) => {
    confirm({
      ...others,
      onCancel: () => {
        observer.next(false);
        observer.error({ status: 'error', error: new Error('Unconfirmed') });
      },
      onOk: (close) => {
        if (handleOk) {
          handleOk(observer, close);
        } else {
          observer.next(true);
          close();
        }
        observer.complete();
      },
      afterClose: () => {
        if (afterClose) {
          afterClose();
        }
      },
    });
  });
}

export type AfterTxCreator = (tx: Tx) => () => void;

type ExecObsCreator = () => Observable<Tx>;

export function createTxWorkflow(
  before: Observable<boolean>,
  txObs: Observable<Tx> | ExecObsCreator,
  after: AfterTxCreator
): Observable<Tx> {
  let finish: () => void = noop;

  return before.pipe(
    switchMap((confirmed) => {
      return confirmed
        ? (isFunction(txObs) ? txObs() : txObs).pipe(
            tap((tx) => {
              if (tx.status === 'finalized') {
                finish = after(tx);
              }
            }),
            finalize(() => finish())
          )
        : EMPTY;
    })
  );
}
