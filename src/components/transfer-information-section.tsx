import { SortedLnBridgeRelayInfosResData, Token } from "@/types";
import TransferInformation from "./transfer-information";
import TransferSection from "./transfer-section";

interface Props {
  transactionFee?: { loading: boolean; value?: bigint; token?: Token; warning?: string };
  transferLimit?: { loading: boolean; value?: bigint; token?: Token };
  dailyLimit?: { loading: boolean; value?: bigint; token?: Token };
  // estimatedTime: { loading: boolean; value?: string };
  sourceToken: Token;
  relayData: SortedLnBridgeRelayInfosResData | undefined;
  loadingRelayData: boolean;
}

export default function TransferInformationSection({
  transactionFee,
  transferLimit,
  dailyLimit,
  sourceToken,
  relayData,
  loadingRelayData,
}: Props) {
  return (
    <TransferSection titleText="Information">
      <TransferInformation
        transactionFee={transactionFee}
        transferLimit={{
          loading: loadingRelayData,
          value: relayData?.sortedLnBridgeRelayInfos?.transferLimit
            ? BigInt(relayData.sortedLnBridgeRelayInfos.transferLimit)
            : undefined,
          token: sourceToken,
        }}
        dailyLimit={dailyLimit}
        estimatedTime={{ loading: true }}
      />
    </TransferSection>
  );
}
