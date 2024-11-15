import { Address, Hash } from "viem";

export async function fetchMsgportFeeAndParams(
  fromChainId: number,
  toChainId: number,
  fromAddress: Address,
  toAddress: Address,
  refundAddress: Address,
  payload: Hash,
) {
  const endpoint = "https://api.msgport.xyz";

  const feeRes = await fetch(
    `${endpoint}/ormp/fee?from_chain_id=${fromChainId}&to_chain_id=${toChainId}&payload=${payload}&from_address=${fromAddress}&to_address=${toAddress}&refund_address=${refundAddress}`,
  );
  const feeJson = (await feeRes.json()) as { code: number; data: { fee: string; params: Hash } };
  if (feeRes.ok && feeJson.code === 0) {
    const fee = BigInt(feeJson.data.fee); // In native token
    const params = feeJson.data.params;
    return { fee, params };
  }
}

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}
