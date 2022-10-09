import { BigNumber, Contract } from 'ethers';
import { abi } from 'shared/config/abi';
import { CrossChainDirection, CrossToken, DailyLimit, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { isRing } from 'shared/utils/helper/validator';
import { getS2SMappingAddress } from 'shared/utils/mappingToken';

export async function getDailyLimit(
  token: string,
  direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>
): Promise<DailyLimit | null> {
  const {
    to: { meta: arrival },
  } = direction;
  const mappingAddress = await getS2SMappingAddress(arrival.provider);
  const contract = new Contract(mappingAddress, abi.S2SMappingTokenABI, entrance.web3.currentProvider);
  const ringAddress = token;
  const tokenAddress = isRing(direction.from.symbol) ? ringAddress : '';

  if (!tokenAddress) {
    return null;
  }

  const limit: BigNumber = await contract.dailyLimit(tokenAddress);
  const spentToday: BigNumber = await contract.spentToday(tokenAddress);

  return { limit: limit.toString(), spentToday: spentToday.toString() };
}
