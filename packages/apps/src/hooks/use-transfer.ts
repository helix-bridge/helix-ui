import { TransferContext } from "@/providers/transfer-provider";
import { useContext } from "react";

export const useTransfer = () => useContext(TransferContext);
