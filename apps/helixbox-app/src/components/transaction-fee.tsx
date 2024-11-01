import { ExplorerTxByIdQuery } from "../_generated_/gql/graphql";
import { Network } from "../types";
import { formatBalance } from "../utils/balance";
import { getChainConfig } from "../utils/chain";

interface Props {
  record: ExplorerTxByIdQuery["historyRecordById"];
}

export default function TransactionFee({ record }: Props) {
  const token = getChainConfig(record?.fromChain as Network | undefined)?.tokens.find(
    ({ symbol }) => symbol.toUpperCase() === record?.feeToken.toUpperCase(),
  );

  return (
    <span className="text-sm font-medium text-white">
      {token && record?.fee
        ? `${formatBalance(BigInt(record.fee), token.decimals, { keepZero: false, precision: 4 })} ${token.symbol}`
        : null}
    </span>
  );
}
