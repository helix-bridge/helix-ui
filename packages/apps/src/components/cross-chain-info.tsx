import { BaseBridge } from "@/bridges/base";
import { ChainToken } from "@/types/cross-chain";
import CountLoading from "@/ui/count-loading";
import { formatBalance } from "@/utils/balance";
import { getChainConfig } from "@/utils/chain";
import { PropsWithChildren } from "react";

interface Props {
  fee: bigint;
  bridge?: BaseBridge | null;
  loading?: boolean;
  sourceValue?: ChainToken | null;
}

export default function CrossChainInfo({ fee, bridge, loading, sourceValue }: Props) {
  const token = getChainConfig(sourceValue?.network)?.tokens.find(({ symbol }) => sourceValue?.symbol === symbol);

  return (
    <div className="bg-app-bg p-middle gap-small flex flex-col rounded border border-transparent">
      <Section>
        <span>Bridge</span>
        <span>{bridge?.getName() || "-"}</span>
      </Section>
      <Section>
        <span>Estimated Arrival Time</span>
        <span>{bridge?.getEstimateTime() || "-"}</span>
      </Section>
      <Section>
        <span>Transaction Fee</span>
        {loading ? (
          <CountLoading color="white" />
        ) : token ? (
          <span>
            {formatBalance(fee, token.decimals, { keepZero: false })} {token.symbol}
          </span>
        ) : (
          <span>-</span>
        )}
      </Section>
    </div>
  );
}

function Section({ children }: PropsWithChildren<unknown>) {
  return <div className="flex items-center justify-between text-sm font-normal text-white">{children}</div>;
}
