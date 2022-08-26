import BN from 'bn.js';
import { CrossChainDirection, CrossToken, DVMChainConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { entrance } from 'shared/utils/connection';
import { AbiItem } from 'web3-utils';
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
  const web3 = entrance.web3.getInstance(departure.provider);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: burnAbi, address: bridge.config.contracts?.issuing };

  const contract = new web3.eth.Contract(abi as AbiItem[], address);

  const fee = await contract.methods.fee().call();

  return new BN(fee);
}
