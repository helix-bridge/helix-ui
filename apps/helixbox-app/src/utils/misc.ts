import { FEE_RATE_BASE, FEE_RATE_MAX, FEE_RATE_MAX_V3, FEE_RATE_MIN } from "../config/constant";
import { RecordResult } from "../types/graphql";
import { Address, Hash, Hex, isHash, isHex } from "viem";

export function parseRecordResult(result: RecordResult) {
  switch (result) {
    case RecordResult.PENDING:
      return "Pending";
    case RecordResult.PENDING_TO_CONFIRM_REFUND:
      return "Refunding";
    case RecordResult.PENDING_TO_REFUND:
      return "Pending to Refund";
    case RecordResult.PENDING_TO_CLAIM:
      return "Pending to Claim";
    case RecordResult.REFUNDED:
      return "Refunded";
    case RecordResult.SUCCESS:
      return "Finished";
    default:
      return "Unknown";
  }
}

export function getTokenLogoSrc(fileName: string | null | undefined) {
  return fileName?.startsWith?.("http") ? fileName : `images/token/${fileName || "unknown.svg"}`;
}

export function getChainLogoSrc(fileName: string | null | undefined) {
  return fileName?.startsWith?.("http") ? fileName : `images/network/${fileName || "unknown.png"}`;
}

export function getBridgeLogoSrc(fileName: string) {
  return fileName?.startsWith?.("http") ? fileName : `images/bridge/${fileName}`;
}

export function parseFeeRate(rate: string) {
  return Math.round(Number(rate) * FEE_RATE_BASE);
}

export function formatFeeRate(rate: number) {
  return Number((rate / FEE_RATE_BASE).toFixed(3));
}

export function isValidFeeRate(rate: number, isV3?: boolean) {
  const min = FEE_RATE_MIN;
  const max = isV3 ? FEE_RATE_MAX_V3 : FEE_RATE_MAX;
  return min <= rate && rate <= max;
}

export async function fetchMsglineFeeAndParams(
  fromChainId: number,
  toChainId: number,
  fromMessager: Address,
  toMessager: Address,
  sender: Address,
  payload: Hex,
) {
  // const endpoint = 'https://msgport-api.darwinia.network';  // v1
  const endpoint = "https://api.msgport.xyz"; // v2

  const feeData = await fetch(
    `${endpoint}/ormp/fee?from_chain_id=${fromChainId}&to_chain_id=${toChainId}&payload=${payload}&from_address=${fromMessager}&to_address=${toMessager}&refund_address=${sender}`,
  );
  const feeJson = await feeData.json();
  if (feeData.ok && feeJson.code === 0) {
    const fee = BigInt(feeJson.data.fee); // In native token
    const extParams = feeJson.data.params as Hex;
    return { fee, extParams };
  }
}

/**
 * Extract transfer IDs
 * @param ids IDs from history records
 * @returns Hex[]
 */
export function extractTransferIds(ids: string[]): Hex[] {
  return ids.map((id) => {
    const transferId = id.split("-").slice(-1).at(0);
    if (!transferId || !isHex(transferId)) {
      throw new Error(`Failed to extract transfer id, id: ${id}`);
    }
    return transferId;
  });
}

export function parseConfirmedBlocks(confirmedBlocks: string | null | undefined) {
  let hash: Hash | undefined;
  let total: number | undefined;
  let completed: number | undefined;

  if (confirmedBlocks) {
    const splited = confirmedBlocks.split("/");

    if (isHash(confirmedBlocks)) {
      hash = confirmedBlocks;
    } else if (splited.length === 2) {
      completed = Number(splited[0]);
      total = Number(splited[1]);
    }
  }

  return { hash, total, completed };
}
