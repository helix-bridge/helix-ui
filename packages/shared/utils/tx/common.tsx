import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { Modal, ModalFuncProps, ModalProps } from 'antd';
import BN from 'bn.js';
import { noop } from 'lodash';
import { i18n } from 'next-i18next';
import React from 'react';
import { initReactI18next, Trans } from 'react-i18next';
import { EMPTY, Observable, Observer, switchMap, tap, finalize } from 'rxjs';
import Web3 from 'web3';
import { PromiEvent, TransactionConfig, TransactionReceipt } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { Icon } from '../../components/widget/Icon';
import { abi } from '../../config/abi';
import { CrossChainPayload, RequiredPartial, Tx, TxFn } from '../../model';
import { entrance, waitUntilConnected } from '../connection';

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
  fn: (contract: Contract) => PromiEvent<unknown>,
  contractAbi: AbiItem | AbiItem[] = abi.tokenABI
): Observable<Tx> {
  return new Observable((observer) => {
    try {
      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
      const contract = new web3.eth.Contract(contractAbi, contractAddress) as unknown as Contract;

      observer.next({ status: 'signing' });

      fn(contract)
        .on('transactionHash', (hash: string) => {
          observer.next({ status: 'queued', hash });
        })
        .on('receipt', ({ transactionHash }: TransactionReceipt) => {
          observer.next({ status: 'finalized', hash: transactionHash });
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

export function genEthereumTransactionObs(params: TransactionConfig): Observable<Tx> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

  return new Observable((observer) => {
    const tx = web3.eth.sendTransaction(params);

    tx.on('transactionHash', (hash) => {
      observer.next({ status: 'queued', hash });
    })
      .on('receipt', ({ transactionHash }: TransactionReceipt) => {
        observer.next({ status: 'finalized', hash: transactionHash });
        observer.complete();
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
    sendOptions?: { gas: string; gasPrice: string };
  }
> = ({ sender, tokenAddress, spender, sendOptions }) => {
  if (!tokenAddress) {
    throw new Error(`Can not approve the token with address ${tokenAddress}`);
  }

  if (!spender) {
    throw new Error(`No spender account set`);
  }

  const hardCodeAmount = '100000000000000000000000000';
  const params = sendOptions ? { from: sender, ...sendOptions } : { from: sender };

  return genEthereumContractTxObs(tokenAddress, (contract) =>
    contract.methods.approve(spender, Web3.utils.toWei(hardCodeAmount)).send(params)
  );
};

export async function getAllowance(
  sender: string,
  spender: string,
  tokenAddress: string,
  provider: string
): Promise<BN | null> {
  const web3 = entrance.web3.getInstance(provider);
  const erc20Contract = new web3.eth.Contract(abi.tokenABI, tokenAddress);

  try {
    const allowanceAmount = await erc20Contract.methods.allowance(sender, spender).call();

    return Web3.utils.toBN(allowanceAmount);
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
  const registry = new TypeRegistry();

  return registry.createType('Vec<Bytes>', proof.proof.toJSON());
}
