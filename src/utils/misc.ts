import { FEE_RATE_BASE, FEE_RATE_MAX, FEE_RATE_MIN } from "@/config/constant";
import { RecordResult } from "@/types/graphql";
import { Address, Hex } from "viem";

export function parseRecordResult(result: RecordResult) {
  switch (result) {
    case RecordResult.PENDING:
      return "Pending";
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
  return `/images/token/${fileName || "unknown.svg"}`;
}

export function getChainLogoSrc(fileName: string | null | undefined) {
  return `/images/network/${fileName || "unknown.png"}`;
}

export function getBridgeLogoSrc(fileName: string) {
  return `/images/bridge/${fileName}`;
}

export function parseFeeRate(rate: string) {
  return Math.round(Number(rate) * FEE_RATE_BASE);
}

export function formatFeeRate(rate: number) {
  return Number((rate / FEE_RATE_BASE).toFixed(3));
}

export function isValidFeeRate(rate: number) {
  return FEE_RATE_MIN <= rate && rate <= FEE_RATE_MAX;
}

export async function fetchMsgportFeeAndParams(
  sourceChainId: number,
  targetChainId: number,
  sourceMessager: Address,
  targetMessager: Address,
  sender: Address,
  payload: Hex,
) {
  const feeData = await fetch(
    `https://msgport-api.darwinia.network/ormp_ext/fee?from_chain_id=${sourceChainId}&to_chain_id=${targetChainId}&payload=${payload}&from_address=${sourceMessager}&to_address=${targetMessager}&refund_address=${sender}`,
  );
  const feeJson = await feeData.json();
  if (feeData.ok && feeJson.code === 0) {
    const fee = BigInt(feeJson.data.fee);
    const extParams = feeJson.data.params as Hex;
    return { fee, extParams };
  }
}
