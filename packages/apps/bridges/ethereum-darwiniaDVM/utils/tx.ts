import { abi } from '@helix/shared/config/abi';
import { TxFn, Tx } from '@helix/shared/model';
import { getBridge, genEthereumContractTxObs, getErc20MappingAddress } from '@helix/shared/utils';
import { Observable, from, switchMap } from 'rxjs';
import { EthereumDVMBridgeConfig, Erc20TxPayload } from '../model';

export const redeem: TxFn<Erc20TxPayload> = (value) => {
  const { asset, recipient, amount, direction, sender } = value;
  const bridge = getBridge<EthereumDVMBridgeConfig>(direction);
  const { address } = asset;

  return genEthereumContractTxObs(
    bridge.config.contracts.redeem,
    (contract) => contract.methods.crossSendToken(address, recipient, amount).send({ from: sender }),
    abi.bankErc20ABI
  );
};

export function issuing(value: Erc20TxPayload): Observable<Tx> {
  const { asset, recipient, amount, direction: transfer, sender } = value;
  const { address } = asset;

  return from(getErc20MappingAddress(transfer.from.provider.rpc)).pipe(
    switchMap((mappingAddress) =>
      genEthereumContractTxObs(
        mappingAddress,
        (contract) => contract.methods.crossSendToken(address, recipient, amount).send({ from: sender }),
        abi.Erc20MappingTokenABI
      )
    )
  );
}
