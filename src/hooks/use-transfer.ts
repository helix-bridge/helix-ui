import { useContext } from "react";
import { TransferContext } from "../providers/transfer-provider/context";

export function useTransfer() {
  return useContext(TransferContext);
}
