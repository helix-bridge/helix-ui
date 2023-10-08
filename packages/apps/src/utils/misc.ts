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
      return "Success";
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
