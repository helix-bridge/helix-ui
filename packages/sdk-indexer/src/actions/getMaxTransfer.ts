import { graphql } from "../generated";
import { Address } from "viem";
import { Chain } from "@helixbridge/chains";
import { execute } from "./helper";

const document = graphql(`
  query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {
    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)
  }
`);

export type MaxTransfer = BigInt;

export async function getMaxTransfer(
  endpoint: string,
  token: Address,
  balance: bigint,
  fromChain: Chain,
  toChain: Chain,
) {
  const { data } = await execute(endpoint, document, {
    token,
    balance: balance.toString(),
    fromChain: fromChain.network,
    toChain: toChain.network,
  });

  return BigInt(data?.queryMaxTransfer ?? 0);
}
