import { Record } from "@/types";
import { formatBlanace } from "@/utils";
import { getChainConfig } from "helix.js";

interface Props {
  record?: Record | null;
}

export default function TransactionValue({ record }: Props) {
  const chainConfig = record?.fromChain ? getChainConfig(record.fromChain) : undefined;
  const token = chainConfig?.tokens.find(({ symbol }) => symbol === record?.sendToken);

  return (
    <span className="text-sm font-normal text-white">
      {token && record?.sendAmount
        ? `${formatBlanace(BigInt(record.sendAmount), token.decimals, { keepZero: false, precision: 4 })} ${
            token.symbol
          }`
        : null}
    </span>
  );
}
