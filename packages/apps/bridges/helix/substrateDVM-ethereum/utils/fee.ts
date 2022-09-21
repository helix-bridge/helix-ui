import BN from 'bn.js';
import { Contract } from 'ethers';
import { ChainConfig, CrossChainDirection, CrossToken } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { getBridge } from '../../../../utils';
import backingAbi from '../config/backing.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';

export async function getFee(
  direction: CrossChainDirection<Pick<CrossToken<ChainConfig>, 'meta'>, Pick<CrossToken<ChainConfig>, 'meta'>>,
  useWallerProvider = false
): Promise<BN | null> {
  const {
    from: { meta: departure },
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing };

  const contract = new Contract(
    address as string,
    abi,
    useWallerProvider ? entrance.web3.currentProvider : entrance.web3.getInstance(direction.from.meta.provider)
  );

  const fee = await contract.currentFee();

  return new BN(fee.toString());
}
