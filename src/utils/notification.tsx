import { ChainConfig } from "../types/chain";
import { notification } from "../ui/notification";
import NotifyLink from "../ui/notify-link";
import { TransactionReceipt } from "viem";

export function notifyTransaction(receipt?: TransactionReceipt, chain?: ChainConfig, title?: string) {
  const explorer = chain?.blockExplorers?.default.url;
  const txHash = receipt?.transactionHash;
  const href = new URL(`tx/${txHash}`, explorer).href;

  if (receipt?.status === "success" && txHash) {
    notification.success({
      title: `${title ?? "Transaction"} successful`,
      description: <NotifyLink href={href}>{txHash}</NotifyLink>,
    });
  } else if (receipt?.status === "reverted" && explorer) {
    notification.error({
      title: `${title ?? "Transaction"} failed`,
      description: <NotifyLink href={href}>{txHash}</NotifyLink>,
    });
  }
}

export function notifyError(err: unknown) {
  return notification.error({ title: "Oops an error occurred", description: (err as Error).message });
}
