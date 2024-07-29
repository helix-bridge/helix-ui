import { HistoryRecord } from "../types/graphql";
import Tooltip from "../ui/tooltip";
import PrettyAddress from "./pretty-address";
import { BaseBridge } from "../bridges/base";
import { Network } from "../types/chain";
import { TokenSymbol } from "../types/token";
import { getChainConfig } from "../utils/chain";
import { getChainLogoSrc, getTokenLogoSrc } from "../utils/misc";
import { formatBalance } from "../utils/balance";
import { Address } from "viem";

interface Props {
  record?: HistoryRecord | null;
  bridge?: BaseBridge | null;
}

export default function TokenTransfer({ record, bridge }: Props) {
  const contract = bridge?.getContract();

  return record && contract ? (
    <div className="flex flex-col items-start justify-between">
      <Item
        chain={record.fromChain}
        from={record.sender}
        to={contract.sourceAddress}
        symbol={record.sendToken}
        amount={BigInt(record.sendAmount || 0)}
      />
      <Item
        chain={record.toChain}
        from={contract.targetAddress}
        to={record.recipient}
        symbol={record.recvToken}
        amount={BigInt(record.recvAmount || 0)}
      />
    </div>
  ) : null;
}

function Item({
  chain,
  from,
  to,
  symbol,
  amount,
}: {
  chain: Network;
  from: Address;
  to: Address;
  symbol: TokenSymbol;
  amount: bigint;
}) {
  const chainConfig = getChainConfig(chain);
  const token = chainConfig?.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());

  return token && chainConfig ? (
    <div className="gap-medium flex items-center">
      <Tooltip content={chainConfig.name} className="shrink-0">
        <img
          width={16}
          height={16}
          alt="Chain logo"
          src={getChainLogoSrc(chainConfig.logo)}
          className="shrink-0 rounded-full"
        />
      </Tooltip>
      <Label text="From" />
      <DisplayAddress address={from} />
      <Label text="To" />
      <DisplayAddress address={to} />
      <Label text="For" />
      <img
        width={16}
        height={16}
        alt="Token icon"
        src={getTokenLogoSrc(token.logo)}
        className="shrink-0 rounded-full"
      />
      <span className="text-sm font-medium text-white">
        {formatBalance(amount, token.decimals, { keepZero: false, precision: 4 })} {symbol}
      </span>
    </div>
  ) : null;
}

function DisplayAddress({ address }: { address: Address }) {
  return (
    <div className="inline-block w-24 truncate">
      <PrettyAddress address={address} forceShort className="text-primary text-sm font-medium" />
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <span className="text-sm font-medium text-white">{text}</span>;
}
