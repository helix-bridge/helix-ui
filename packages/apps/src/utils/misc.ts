import { RecordStatus } from "@/types/graphql";

export function formatRecordStatus(status: RecordStatus) {
  switch (status) {
    case RecordStatus.Pending:
      return "Pending";
    case RecordStatus.PendingToRefund:
      return "Pending to Refund";
    case RecordStatus.PendingToClaim:
      return "Pending to Claim";
    case RecordStatus.Refunded:
      return "Refunded";
    case RecordStatus.Success:
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
