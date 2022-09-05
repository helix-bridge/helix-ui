import { Contract } from 'ethers';
import { CrossChainDirection, CrossToken, DailyLimit, DVMChainConfig } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
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

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing }
    : { abi: burnAbi, address: bridge.config.contracts?.issuing };

  const contract = new Contract(address as string, abi);

  const limit = await contract.methods.dailyLimit(fromTokenAddress).call();
  const spentToday = await contract.methods.spentToday(fromTokenAddress).call();

  return { limit, spentToday };
}
