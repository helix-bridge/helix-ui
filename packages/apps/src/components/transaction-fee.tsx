import { Record } from "@/types";
import { formatBlanace } from "@/utils";
import { getChainConfig } from "helix.js";

interface Props {
  record?: Record | null;
}

export default function TransactionFee({ record }: Props) {
  const chainConfig = record?.fromChain ? getChainConfig(record.fromChain) : undefined;
  const token = chainConfig?.tokens.find(({ symbol }) => symbol === record?.feeToken);

  return (
    <span className="text-sm font-normal text-white">
      {token && record?.fee
        ? `${formatBlanace(BigInt(record.fee), token.decimals, { keepZero: false, precision: 4 })} ${token.symbol}`
        : null}
    </span>
  );
}
