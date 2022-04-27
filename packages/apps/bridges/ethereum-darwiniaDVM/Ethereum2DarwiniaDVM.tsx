import { RegisterStatus } from 'shared/config/constant';
import { CrossChainComponentProps, CrossChainDirection } from 'shared/model';
import { getBridge } from 'shared/utils';
import { useCallback } from 'react';
import { DVM } from '../DVM/DVM';
import { EthereumDVMBridgeConfig, Erc20Payload } from './model';
import { redeem } from './utils/tx';

export function Ethereum2DarwiniaDVM({ form, setSubmit, direction }: CrossChainComponentProps<Erc20Payload>) {
  const spenderResolver = useCallback((dir: CrossChainDirection) => {
    const bridge = getBridge<EthereumDVMBridgeConfig>(dir);
    return Promise.resolve(bridge.config.contracts.issuing ?? '');
  }, []);

  return (
    <DVM
      form={form}
      direction={direction}
      setSubmit={setSubmit}
      transform={redeem}
      spenderResolver={spenderResolver}
      canRegister
      tokenRegisterStatus={RegisterStatus.unregister}
    />
  );
}
