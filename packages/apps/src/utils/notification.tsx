import { Network } from "@/types/chain";
import { notification } from "@/ui/notification";
import { TransactionReceipt } from "viem";
import { getChainConfig } from "./chain";

export function notifyTransaction(receipt?: TransactionReceipt, network?: Network) {
  const explorer = getChainConfig(network)?.blockExplorers?.default.url;

  if (receipt?.status === "success" && explorer) {
    notification.success({
      title: "Transaction successful",
      description: (
        <a
          target="_blank"
          rel="noopener"
          className="text-primary break-all hover:underline"
          href={`${explorer}tx/${receipt.transactionHash}`}
        >
          {receipt.transactionHash}
        </a>
      ),
    });
  } else if (receipt?.status === "reverted" && explorer) {
    notification.error({
      title: "Transaction failed.",
      description: (
        <a
          target="_blank"
          rel="noopener"
          className="text-primary break-all hover:underline"
          href={`${explorer}tx/${receipt.transactionHash}`}
        >
          {receipt.transactionHash}
        </a>
      ),
    });
  }
}
