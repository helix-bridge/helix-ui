import { ChainConfig } from "@/types/chain";
import { notification } from "@/ui/notification";
import { TransactionReceipt } from "viem";

export function notifyTransaction(receipt?: TransactionReceipt, chain?: ChainConfig) {
  const explorer = chain?.blockExplorers?.default.url;
  const txHash = receipt?.transactionHash;
  const href = new URL(`tx/${txHash}`, explorer).href;

  if (receipt?.status === "success" && txHash) {
    notification.success({
      title: "Transaction successful",
      description: (
        <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
          {txHash}
        </a>
      ),
    });
  } else if (receipt?.status === "reverted" && explorer) {
    notification.error({
      title: "Transaction failed",
      description: (
        <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
          {txHash}
        </a>
      ),
    });
  }
}

export function notifyError(err: unknown) {
  return notification.error({ title: "An error occurred", description: (err as Error).message });
}
