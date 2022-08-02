import { CrossChainDirection, CrossToken, DailyLimit, DVMChainConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { entrance } from 'shared/utils/connection';
import { AbiItem } from 'web3-utils';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';

export async function getDailyLimit(
  direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
): Promise<DailyLimit | null> {
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

  const limit = await contract.methods.dailyLimit(tokenAddress).call();
  const spentToday = await contract.methods.spentToday(tokenAddress).call();

  return { limit, spentToday };
}
