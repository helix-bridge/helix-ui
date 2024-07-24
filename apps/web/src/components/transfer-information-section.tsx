import { SortedLnBridgeRelayInfosResData, Token } from "../types";
import TransferInformation from "./transfer-information";
import TransferSection from "./transfer-section";
import { BaseBridge } from "../bridges";
import { useMemo } from "react";
import { useDailyLimit } from "../hooks";

interface Props {
  sourceToken: Token;
  relayData: SortedLnBridgeRelayInfosResData | undefined;
  loadingRelayData: boolean;
  bridge: BaseBridge | undefined;
  fee: { token: Token; value: bigint } | null | undefined;
  loadingFee: boolean;
}

export default function TransferInformationSection({
  sourceToken,
  relayData,
  loadingRelayData,
  bridge,
  fee,
  loadingFee,
}: Props) {
  const hasRelayer = useMemo(
    () => 0 < (relayData?.sortedLnBridgeRelayInfos?.records.length || 0),
    [relayData?.sortedLnBridgeRelayInfos?.records.length],
  );
  const { loading: loadingDailyLimit, dailyLimit } = useDailyLimit(bridge);

  return (
    <TransferSection>
      <TransferInformation
        transferLimit={{
          loading: loadingRelayData,
          value: relayData?.sortedLnBridgeRelayInfos?.transferLimit
            ? BigInt(relayData.sortedLnBridgeRelayInfos.transferLimit)
            : undefined,
          token: sourceToken,
        }}
        estimatedTime={hasRelayer ? { loading: loadingRelayData, value: bridge?.formatEstimateTime() } : undefined}
        transactionFee={{
          warning: fee ? undefined : "Liquidity is not enough",
          loading: loadingFee,
          value: fee?.value,
          token: fee?.token,
        }}
        dailyLimit={
          dailyLimit ? { loading: loadingDailyLimit, value: dailyLimit.limit, token: dailyLimit.token } : undefined
        }
      />
    </TransferSection>
  );
}
