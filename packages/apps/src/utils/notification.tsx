import { ChainConfig } from "@/types/chain";
import { notification } from "@/ui/notification";
import { PropsWithChildren } from "react";
import { TransactionReceipt } from "viem";

function Link({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
      {children}
    </a>
  );
}

export function notifyTransaction(receipt?: TransactionReceipt, chain?: ChainConfig) {
  const explorer = chain?.blockExplorers?.default.url;
  const txHash = receipt?.transactionHash;
  const href = new URL(`tx/${txHash}`, explorer).href;

  if (receipt?.status === "success" && txHash) {
    notification.success({
      title: "Transaction successful",
      description: <Link href={href}>{txHash}</Link>,
    });
  } else if (receipt?.status === "reverted" && explorer) {
    notification.error({
      title: "Transaction failed",
      description: <Link href={href}>{txHash}</Link>,
    });
  }
}

export function notifyError(err: unknown) {
  return notification.error({ title: "An error occurred", description: (err as Error).message });
}
