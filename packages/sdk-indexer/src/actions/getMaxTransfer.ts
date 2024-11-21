import { graphql } from "../generated/action";
import { Address } from "viem";
import { Chain } from "@helixbridge/chains";
import { execute } from "./helpers";

const document = graphql(`
  query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {
    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)
  }
`);

export type MaxTransfer = BigInt;

export async function getMaxTransfer(
  endpoint: string,
  fromChain: Chain,
  toChain: Chain,
  fromToken: Address,
  senderBalance: bigint,
) {
  const { data } = await execute(endpoint, document, {
    token: fromToken,
    balance: senderBalance.toString(),
    fromChain: fromChain.network,
    toChain: toChain.network,
  });

  return BigInt(data?.queryMaxTransfer ?? 0);
}
