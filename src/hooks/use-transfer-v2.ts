import { TransferContext } from "@/providers/transfer-provider-v2";
import { useContext } from "react";

export function useTransferV2() {
  return useContext(TransferContext);
}
