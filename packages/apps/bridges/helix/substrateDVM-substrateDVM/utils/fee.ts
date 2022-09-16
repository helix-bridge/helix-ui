import BN from 'bn.js';
import { Contract } from 'ethers';
import { CrossChainDirection, CrossToken, DVMChainConfig } from 'shared/model';
import { getBridge } from 'utils/bridge';
import { entrance } from 'shared/utils/connection';
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

  const contract = new Contract(address as string, abi, entrance.web3.currentProvider);

  const fee = await contract.fee();

  return new BN(fee.toString());
}
