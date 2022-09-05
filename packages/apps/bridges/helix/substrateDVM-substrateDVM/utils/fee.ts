import BN from 'bn.js';
import { CrossChainDirection, CrossToken, DVMChainConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { Contract } from 'ethers';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';

export async function getFee(
  direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
): Promise<BN | null> {
  const {
    from: { meta: departure },
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: burnAbi, address: bridge.config.contracts?.issuing };

  const contract = new Contract(address as string, abi);

  const fee = await contract.methods.fee().call();

  return new BN(fee);
}
