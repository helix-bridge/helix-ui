import { BN } from '@polkadot/util';
import { Contract } from 'ethers';
import { CrossChainDirection, CrossToken, EthereumChainConfig } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { getBridge } from 'utils/bridge';
import backingAbi from '../config/backing.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';

export async function getDailyLimit(
  direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
): Promise<BN | null> {
  const {
    from: { meta: departure, address: fromTokenAddress },
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing };

  const contract = new Contract(address as string, abi, entrance.web3.currentProvider);

  const limit = await contract.calcMaxWithdraw(fromTokenAddress);

  return new BN(limit.toString());
}