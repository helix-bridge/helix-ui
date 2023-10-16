import { ChainConfig } from "@/types/chain";
import { notification } from "@/ui/notification";
import { TransactionReceipt } from "viem";

export function notifyTransaction(receipt?: TransactionReceipt, chain?: ChainConfig) {
  const explorer = chain?.blockExplorers?.default.url;

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
