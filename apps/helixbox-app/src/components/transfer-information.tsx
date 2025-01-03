import { Address } from "viem";
import { Token } from "../types";
import CountLoading from "../ui/count-loading";
import Tooltip from "../ui/tooltip";
import { formatBalance, toShortAdrress } from "../utils";

interface Props {
  transactionFee: { loading: boolean; value?: bigint; token?: Token };
  transferLimit?: { loading: boolean; value?: bigint; token?: Token };
  dailyLimit?: { loading: boolean; value?: bigint; token?: Token };
  estimatedTime?: { loading: boolean; value?: string };
  solver: { loading?: boolean; address?: Address; warning?: string };
}

export default function TransferInformation({
  transactionFee,
  transferLimit,
  dailyLimit,
  estimatedTime,
  solver,
}: Props) {
  return (
    <div className="gap-small px-medium flex flex-col lg:px-3">
      <Row
        name="Estimated Arrival Time"
        loading={estimatedTime?.loading}
        value={estimatedTime?.value || "1~2 Minutes"}
      />
      {transactionFee ? (
        <Row
          name="Transaction Fee"
          loading={transactionFee.loading}
          value={transactionFee.value}
          token={transactionFee.token}
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
      <Row name="Solver" loading={solver.loading} address={solver.address} warning={solver.warning} />
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
  address,
}: {
  name: string;
  loading?: boolean;
  value?: JSX.Element | string | bigint;
  token?: Token;
  tips?: JSX.Element | string;
  warning?: string;
  address?: Address;
}) {
  return (
    <div className="flex h-5 items-center justify-between">
      <div className="gap-small flex items-center">
        <Text value={name} />
        {tips ? (
          <Tooltip content={tips}>
            <img
              width={14}
              height={14}
              alt="Info"
              src="images/info.svg"
              className="h-[0.875rem] w-[0.875rem] shrink-0"
            />
          </Tooltip>
        ) : null}
      </div>

      {loading ? (
        <CountLoading color="white" />
      ) : address ? (
        <Tooltip content={address} enabledSafePolygon>
          <Text value={toShortAdrress(address, 7, 5)} />
        </Tooltip>
      ) : warning ? (
        <Tooltip content={warning} status="warning">
          <img width={20} height={20} alt="Warning" src="images/warning.svg" />
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
  return <span className="text-sm font-extrabold italic text-white">{value}</span>;
}
