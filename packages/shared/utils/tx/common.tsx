import { TransactionRequest, TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import type { ApiPromise } from '@polkadot/api';
import { Modal, ModalFuncProps, ModalProps } from 'antd';
import BN from 'bn.js';
import { Contract } from 'ethers';
import type { BigNumber } from 'ethers';
import type { Deferrable } from 'ethers/lib/utils';
import noop from 'lodash/noop';
import omitBy from 'lodash/omitBy';
import { i18n } from 'next-i18next';
import { initReactI18next, Trans } from 'react-i18next';
import { EMPTY, finalize, Observable, Observer, switchMap, tap } from 'rxjs';
import { Icon } from '../../components/widget/Icon';
import { abi } from '../../config/abi';
import { CrossChainPayload, RequiredPartial, Tx, TxFn } from '../../model';
import { entrance, waitUntilConnected } from '../connection';
import { toWei, typeRegistryFactory } from '../helper';

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
  closable: true,
  closeIcon: <Icon name="close" />,
  okButtonProps: { size: 'large', className: 'w-full', style: { margin: 0 } },
  cancelButtonProps: { size: 'large', hidden: true },
  width: 520,
  centered: true,
  className: 'confirm-modal',
  icon: null,
  destroyOnClose: true,
  title: (
    <h3 className="text-center mb-4">
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

export function createTxWorkflow(
  before: Observable<boolean>,
  txObs: Observable<Tx>,
  after: AfterTxCreator
): Observable<Tx> {
  let finish: () => void = noop;

  return before.pipe(
    switchMap((confirmed) =>
      confirmed
        ? txObs.pipe(
            tap((tx) => {
              if (tx.status === 'finalized') {
                finish = after(tx);
              }
            }),
            finalize(() => finish())
          )
        : EMPTY
    )
  );
}

/**
 * @param contractAddress - Contract address in ethereum
 * @param fn - Contract method to be call, will receive the contract instance as the incoming parameter;
 * @param contractAbi - Contract ABI
 * @returns An Observable which will emit the tx events that includes signing, queued, finalized and error.
 */
export function genEthereumContractTxObs(
  contractAddress: string,
  fn: (contract: Contract) => Promise<TransactionResponse>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contractAbi: any = abi.tokenABI
): Observable<Tx> {
  return new Observable((observer) => {
    try {
      const signer = entrance.web3.currentProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      observer.next({ status: 'signing' });

      fn(contract)
        .then((tx: TransactionResponse) => {
          observer.next({ status: 'queued', hash: tx.hash });

          return tx.wait();
        })
        .then((receipt: TransactionReceipt) => {
          observer.next({ status: 'finalized', hash: receipt.transactionHash });
          observer.complete();
        })
        .catch((error: { code: number; message: string }) => {
          observer.error({ status: 'error', error: error.message });
        });
    } catch (error) {
      console.warn('%c contract tx observable error', 'font-size:13px; background:pink; color:#bf2c9f;', error);
      observer.error({ status: 'error', error: 'Contract construction/call failed!' });
    }
  });
}

export function genEthereumTransactionObs(params: Deferrable<TransactionRequest>): Observable<Tx> {
  const provider = entrance.web3.currentProvider;
  const signer = provider.getSigner();

  return new Observable((observer) => {
    signer.sendTransaction(params).then((res) => {
      observer.next({ status: 'finalized', hash: res.hash });
      observer.complete();
    });

    provider
      .on('transactionHash', (hash) => {
        observer.next({ status: 'queued', hash });
      })
      .on('error', (error) => {
        observer.error({ status: 'error', error: error.message });
      });
  });
}

export const approveToken: TxFn<
  RequiredPartial<CrossChainPayload, 'sender'> & {
    tokenAddress?: string;
    spender?: string;
    sendOptions?: { gas?: string; gasPrice?: string };
  }
> = ({ sender, tokenAddress, spender, sendOptions }) => {
  if (!tokenAddress) {
    throw new Error(`Can not approve the token with address ${tokenAddress}`);
  }

  if (!spender) {
    throw new Error(`No spender account set`);
  }

  const hardCodeAmount = '100000000000000000000000000';
  const params = sendOptions ? { from: sender, ...omitBy(sendOptions, (value) => !value) } : { from: sender };

  return genEthereumContractTxObs(tokenAddress, (contract) =>
    contract.approve(spender, toWei({ value: hardCodeAmount }), params)
  );
};

export async function getAllowance(
  sender: string,
  spender: string,
  tokenAddress: string,
  provider: string
): Promise<BN | null> {
  const contract = new Contract(tokenAddress, abi.tokenABI, entrance.web3.getInstance(provider));

  try {
    const allowanceAmount = await contract.allowance(sender, spender).then((res: BigNumber) => res.toString());

    return new BN(allowanceAmount);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('⚠ ~ file: allowance.ts getIssuingAllowance ~ error', error.message);

    return null;
  }
}

/* -------------------------------------------Claim Token---------------------------------------------- */

export async function getMPTProof(
  api: ApiPromise,
  hash = '',
  proofAddress = '0xf8860dda3d08046cf2706b92bf7202eaae7a79191c90e76297e0895605b8b457'
) {
  await waitUntilConnected(api);

  const proof = await api.rpc.state.getReadProof([proofAddress], hash);
  const TypeRegistry = await typeRegistryFactory();
  const registry = new TypeRegistry();

  return registry.createType('Vec<Bytes>', proof.proof.toJSON());
}
