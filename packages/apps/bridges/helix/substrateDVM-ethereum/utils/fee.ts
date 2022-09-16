import BN from 'bn.js';
import { Contract } from 'ethers';
import { CrossChainDirection, CrossToken, EthereumChainConfig } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { getBridge } from '../../../../utils';
import backingAbi from '../config/backing.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';

export async function getFee(
  direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
): Promise<BN | null> {
  const {
    from: { meta: departure },
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing };

  const contract = new Contract(address as string, abi, entrance.web3.currentProvider);

  const fee = await contract.currentFee();

  return new BN(fee.toString());
}
