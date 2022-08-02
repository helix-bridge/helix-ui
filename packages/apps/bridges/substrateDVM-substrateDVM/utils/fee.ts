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
    from: { meta: departure },
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);
  const web3 = entrance.web3.getInstance(bridge.departure.provider);

  const { abi, address } = bridge.isIssuing(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.issuing }
    : { abi: burnAbi, address: bridge.config.contracts?.redeem };

  const contract = new web3.eth.Contract(abi as AbiItem[], address);
  const fee = await contract.methods.fee().call();

  console.log('🚀 ~ file: fee.ts ~ line 25 ~ fee', fee.toString());

  return new BN(fee);
}
