import { RegisterStatus } from 'shared/config/constant';
import { CrossChainComponentProps, CrossChainDirection } from 'shared/model';
import { getBridge } from 'shared/utils';
import { useCallback } from 'react';
import { DVM } from '../DVM/DVM';
import { EthereumDVMBridgeConfig, Erc20Payload } from './model';
import { issuing } from './utils';

/**
 * TODO: Functions need to implement:
 * 1. getFee
 */

/**
 * @description test chain: pangolin dvm -> ropsten
 */
export function DarwiniaDVM2Ethereum({ form, setSubmit, direction }: CrossChainComponentProps<Erc20Payload>) {
  const spenderResolver = useCallback((dir: CrossChainDirection) => {
    const bridget = getBridge<EthereumDVMBridgeConfig>(dir);

    return Promise.resolve(bridget.config.contracts.issuing ?? '');
  }, []);

  return (
    <DVM
      form={form}
      direction={direction}
      setSubmit={setSubmit}
      transform={issuing}
      spenderResolver={spenderResolver}
      canRegister
      tokenRegisterStatus={RegisterStatus.unregister}
    />
  );
}
