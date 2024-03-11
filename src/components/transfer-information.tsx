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
}

export default function TransferInformation({ transactionFee, transferLimit, dailyLimit, estimatedTime }: Props) {
  return (
    <div className="flex flex-col gap-small px-medium">
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
        <span className="text-base font-extrabold text-white">{name}</span>
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
        <Tooltip content={warning}>
          <Image width={16} height={16} alt="Warning" src="/images/warning.svg" />
        </Tooltip>
      ) : typeof value === "bigint" && token ? (
        <span className="text-base font-extrabold text-white">
          {formatBalance(value, token.decimals)} {token.symbol}
        </span>
      ) : typeof value === "string" ? (
        <span className="text-base font-extrabold text-white">{value}</span>
      ) : typeof value !== "bigint" ? (
        value
      ) : null}
    </div>
  );
}
