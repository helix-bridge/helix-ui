import { abi } from 'shared/config/abi';
import { CrossChainDirection, CrossToken, DVMChainConfig, MappingToken, PolkadotChainConfig } from 'shared/model';
import { entrance, getS2SMappingAddress, isRing } from 'shared/utils';

interface DailyLimit {
  limit: string;
  spentToday: string;
}

export async function getDailyLimit(
  token: MappingToken,
  direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>
): Promise<DailyLimit | null> {
  const {
    to: { meta: arrival },
  } = direction;
  const web3 = entrance.web3.getInstance(arrival.ethereumChain.rpcUrls[0]);
  const mappingAddress = await getS2SMappingAddress(arrival.provider);
  const contract = new web3.eth.Contract(abi.S2SMappingTokenABI, mappingAddress);
  //   const token = targetChainTokens.find((item) => isRing(item.symbol));
  const ringAddress = token?.address;
  const tokenAddress = isRing(direction.from.symbol) ? ringAddress : '';

  if (!tokenAddress) {
    return null;
  }

  const limit = await contract.methods.dailyLimit(tokenAddress).call();
  const spentToday = await contract.methods.spentToday(tokenAddress).call();

  return { limit, spentToday };
}
