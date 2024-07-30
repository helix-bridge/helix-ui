import { Abi, Address, GetContractReturnType, PublicClient, WalletClient } from "viem";

type GetContractParams<TAddress, TPublicClient, TWalletClient> = {
  address: TAddress;
  publicClient?: TPublicClient;
  walletClient?: TWalletClient;
};

export type TFunction<TAbi extends Abi | readonly unknown[]> = <
  TAddress extends Address,
  TPublicClient extends PublicClient | undefined = undefined,
  TWalletClient extends WalletClient | undefined = undefined,
>(
  // eslint-disable-next-line no-unused-vars
  _: GetContractParams<TAddress, TPublicClient, TWalletClient>,
) => GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress>;
