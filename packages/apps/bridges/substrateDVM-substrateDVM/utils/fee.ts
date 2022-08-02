import BN from 'bn.js';
import { CrossChainDirection, CrossToken, DVMChainConfig } from 'shared/model';
import { AbiItem } from 'web3-utils';
import { getBridge } from 'shared/utils/bridge';
import { entrance } from 'shared/utils/connection';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';

export async function getFee(
  direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
): Promise<BN | null> {
  const {
    from: { meta: departure, address: fromTokenAddress },
    to: { meta: arrival, address: toTokenAddress },
  } = direction;
  const bridge = getBridge([departure, arrival]);
  const web3 = entrance.web3.getInstance(bridge.departure.provider);

  const { abi, tokenAddress } = bridge.isIssuing(departure, arrival)
    ? { abi: backingAbi, tokenAddress: fromTokenAddress }
    : { abi: burnAbi, tokenAddress: toTokenAddress };

  const contract = new web3.eth.Contract(abi as AbiItem[], tokenAddress);

  const fee = await contract.methods.fee().call();
  console.log('🚀 ~ file: fee.ts ~ line 26 ~ fee', fee);

  // return new BN(fee);
  return fee;
}
