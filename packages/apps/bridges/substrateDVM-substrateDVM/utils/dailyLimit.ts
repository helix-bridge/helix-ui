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
    to: { meta: arrival },
  } = direction;
  const bridge = getBridge([departure, arrival]);
  const web3 = entrance.web3.getInstance(bridge.departure.provider);

  const { abi, address } = bridge.isIssuing(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.issuing }
    : { abi: burnAbi, address: bridge.config.contracts?.redeem };

  const contract = new web3.eth.Contract(abi as AbiItem[], address);

  const limit = await contract.methods.dailyLimit(fromTokenAddress).call();
  const spentToday = await contract.methods.spentToday(fromTokenAddress).call();

  return { limit, spentToday };
}
