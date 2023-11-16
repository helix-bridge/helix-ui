import { FEE_RATE_BASE, FEE_RATE_MAX, FEE_RATE_MIN } from "@/config/constant";
import { RecordStatus } from "@/types/graphql";

export function formatRecordStatus(status: RecordStatus) {
  switch (status) {
    case RecordStatus.PENDING:
      return "Pending";
    case RecordStatus.PENDING_TO_REFUND:
      return "Pending to Refund";
    case RecordStatus.PENDING_TO_CLAIM:
      return "Pending to Claim";
    case RecordStatus.REFUNDED:
      return "Refunded";
    case RecordStatus.SUCCESS:
      return "Finished";
    default:
      return "Unknown";
  }
}

export function getTokenLogoSrc(fileName?: string | null) {
  return `/images/token/${fileName || "unknown.svg"}`;
}

export function getChainLogoSrc(fileName?: string | null) {
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

export function isValidFeeRate(formatted: number) {
  return FEE_RATE_MIN <= formatted && formatted <= FEE_RATE_MAX;
}
