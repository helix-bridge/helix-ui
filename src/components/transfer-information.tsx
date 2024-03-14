import { Token } from "@/types";
import CountLoading from "@/ui/count-loading";
import Tooltip from "@/ui/tooltip";
import { formatBalance } from "@/utils";
import Image from "next/image";

interface Props {
  transactionFee: { loading: boolean; value?: bigint; token?: Token; warning?: string };
  transferLimit?: { loading: boolean; value?: bigint; token?: Token };
  dailyLimit?: { loading: boolean; value?: bigint; token?: Token };
  estimatedTime?: { loading: boolean; value?: string };
  hasRelayer: boolean;
}

export default function TransferInformation({
  transactionFee,
  transferLimit,
  dailyLimit,
  estimatedTime,
  hasRelayer,
}: Props) {
  return hasRelayer ? (
    <div className="flex flex-col gap-small px-medium lg:px-3">
      {estimatedTime ? (
        <Row name="Estimated Arrival Time" loading={estimatedTime.loading} value={estimatedTime.value} />
      ) : null}
      {transactionFee ? (
        <Row
          name="Transaction Fee"
          loading={transactionFee.loading}
          value={transactionFee.value}
          token={transactionFee.token}
          warning={transactionFee.warning}
        />
      ) : null}
      {transferLimit ? (
        <Row
          name="Transfer Limit"
          loading={transferLimit.loading}
          value={transferLimit.value}
          token={transferLimit.token}
          tips="Includes transaction fee"
        />
      ) : null}
      {dailyLimit ? (
        <Row name="Daily Limit" loading={dailyLimit.loading} value={dailyLimit.value} token={dailyLimit.token} />
      ) : null}
    </div>
  ) : (
    <div className="flex items-center justify-center gap-medium py-2">
      <Image width={18} height={18} alt="Warning" src="/images/warning.svg" />
      <span className="text-sm font-extrabold text-white/95">No Relayer</span>
    </div>
  );
}

function Row({
  name,
  loading,
  value,
  token,
  tips,
  warning,
}: {
  name: string;
  loading?: boolean;
  value?: JSX.Element | string | bigint;
  token?: Token;
  tips?: JSX.Element | string;
  warning?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-small">
        <Text value={name} />
        {tips ? (
          <Tooltip content={tips}>
            <Image
              width={14}
              height={14}
              alt="Info"
              src="/images/info.svg"
              className="h-[0.875rem] w-[0.875rem] shrink-0"
            />
          </Tooltip>
        ) : null}
      </div>

      {loading ? (
        <CountLoading color="white" />
      ) : warning ? (
        <Tooltip content={warning} status="warning">
          <Image width={20} height={20} alt="Warning" src="/images/warning.svg" />
        </Tooltip>
      ) : typeof value === "bigint" && token ? (
        <Text value={`${formatBalance(value, token.decimals, { precision: 6 })} ${token.symbol}`} />
      ) : typeof value === "string" ? (
        <Text value={value} />
      ) : typeof value !== "bigint" ? (
        value
      ) : null}
    </div>
  );
}

function Text({ value }: { value: string }) {
  return <span className="text-base font-extrabold text-white/95">{value}</span>;
}
