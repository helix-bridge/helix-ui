import { Contract } from 'ethers';
import { abi } from 'shared/config/abi';
import { CrossChainDirection, CrossToken, DailyLimit, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { isRing } from 'shared/utils/helper';
import { getS2SMappingAddress } from 'shared/utils/mappingToken';

export async function getDailyLimit(
  token: string,
  direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>
): Promise<DailyLimit | null> {
  const {
    to: { meta: arrival },
  } = direction;
  const mappingAddress = await getS2SMappingAddress(arrival.provider);
  const contract = new Contract(mappingAddress, abi.S2SMappingTokenABI);
  const ringAddress = token;
  const tokenAddress = isRing(direction.from.symbol) ? ringAddress : '';

  if (!tokenAddress) {
    return null;
  }

  const limit = await contract.dailyLimit(tokenAddress).call();
  const spentToday = await contract.spentToday(tokenAddress).call();

  return { limit, spentToday };
}
