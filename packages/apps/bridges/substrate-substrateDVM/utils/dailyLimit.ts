import { abi } from 'shared/config/abi';
import { CrossChainDirection, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { isRing } from 'shared/utils/helper';
import { getS2SMappingAddress } from 'shared/utils/mappingToken';

interface DailyLimit {
  limit: string;
  spentToday: string;
}

export async function getDailyLimit(
  token: string,
  direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>
): Promise<DailyLimit | null> {
  const {
    to: { meta: arrival },
  } = direction;
  const web3 = entrance.web3.getInstance(arrival.provider);
  const mappingAddress = await getS2SMappingAddress(arrival.provider);
  const contract = new web3.eth.Contract(abi.S2SMappingTokenABI, mappingAddress);
  const ringAddress = token;
  const tokenAddress = isRing(direction.from.symbol) ? ringAddress : '';

  if (!tokenAddress) {
    return null;
  }

  const limit = await contract.methods.dailyLimit(tokenAddress).call();
  const spentToday = await contract.methods.spentToday(tokenAddress).call();

  return { limit, spentToday };
}
