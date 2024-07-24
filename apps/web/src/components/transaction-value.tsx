import { HistoryRecord } from "../types/graphql";
import { formatBalance } from "../utils/balance";
import { getChainConfig } from "../utils/chain";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionValue({ record }: Props) {
  const token = getChainConfig(record?.fromChain)?.tokens.find(({ symbol }) => symbol === record?.sendToken);

  return (
    <span className="text-sm font-medium text-white">
      {token && record?.sendAmount
        ? `${formatBalance(BigInt(record.sendAmount), token.decimals, { keepZero: false, precision: 4 })} ${
            token.symbol
          }`
        : null}
    </span>
  );
}
