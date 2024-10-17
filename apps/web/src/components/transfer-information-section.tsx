import { Token } from "../types";
import TransferInformation from "./transfer-information";
import TransferSection from "./transfer-section";
import { BaseBridge } from "../bridges";
import { useMemo } from "react";
import { useDailyLimit } from "../hooks";
import { SortedRelayersQuery } from "../_generated_/gql/graphql";
import { Address } from "viem";

interface Props {
  sourceToken: Token;
  sortedRelayers: SortedRelayersQuery["sortedLnBridgeRelayInfos"];
  loadingSortedRelayers: boolean;
  bridge: BaseBridge | undefined;
  fee: { token: Token; value: bigint } | null | undefined;
  loadingFee: boolean;
}

export default function TransferInformationSection({
  sourceToken,
  sortedRelayers,
  loadingSortedRelayers,
  bridge,
  fee,
  loadingFee,
}: Props) {
  const hasRelayer = useMemo(() => 0 < (sortedRelayers?.records?.length || 0), [sortedRelayers?.records?.length]);
  const { loading: loadingDailyLimit, dailyLimit } = useDailyLimit(bridge);

  return (
    <TransferSection>
      <TransferInformation
        transferLimit={{
          loading: loadingSortedRelayers,
          value: sortedRelayers?.transferLimit ? BigInt(sortedRelayers.transferLimit) : undefined,
          token: sourceToken,
        }}
        estimatedTime={hasRelayer ? { loading: loadingSortedRelayers, value: bridge?.formatEstimateTime() } : undefined}
        transactionFee={{
          warning: fee ? undefined : "Liquidity is not enough",
          loading: loadingFee,
          value: fee?.value,
          token: fee?.token,
        }}
        dailyLimit={
          dailyLimit ? { loading: loadingDailyLimit, value: dailyLimit.limit, token: dailyLimit.token } : undefined
        }
        solver={{
          loading: loadingSortedRelayers,
          address: sortedRelayers?.records?.at(0)?.relayer as Address | undefined,
        }}
      />
    </TransferSection>
  );
}
