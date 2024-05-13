import { HistoryRecord } from "@/types/graphql";
import { formatBalance } from "@/utils/balance";
import { getChainConfig } from "@/utils/chain";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionFee({ record }: Props) {
  const token = getChainConfig(record?.fromChain)?.tokens.find(({ symbol }) => symbol === record?.feeToken);

  return (
    <span className="text-sm font-medium text-white">
      {token && record?.fee
        ? `${formatBalance(BigInt(record.fee), token.decimals, { keepZero: false, precision: 4 })} ${token.symbol}`
        : null}
    </span>
  );
}
