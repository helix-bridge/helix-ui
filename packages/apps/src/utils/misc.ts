import { RecordStatus } from "@/types";

export function formatRecordStatus(status: RecordStatus) {
  switch (status) {
    case RecordStatus.Pending:
      return "Pending";
    case RecordStatus.Refunded:
      return "Refunded";
    case RecordStatus.Success:
      return "Success";
    default:
      return "-";
  }
}
