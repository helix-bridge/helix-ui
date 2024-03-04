import { HistoryRecord } from "@/types/graphql";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import PrettyAddress from "./pretty-address";
import { BaseBridge } from "@/bridges/base";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import { formatBalance } from "@/utils/balance";
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
  const token = chainConfig?.tokens.find((t) => t.symbol === symbol);

  return token && chainConfig ? (
    <div className="flex items-center gap-medium">
      <Tooltip content={chainConfig.name} className="shrink-0">
        <Image
          width={16}
          height={16}
          alt="Chain logo"
          src={getChainLogoSrc(chainConfig.logo)}
          className="shrink-0 rounded-full"
        />
      </Tooltip>
      <Label text="From" />
      <Address address={from} />
      <Label text="To" />
      <Address address={to} />
      <Label text="For" />
      <Image width={16} height={16} alt="Token icon" src={getTokenLogoSrc(token.logo)} className="shrink-0" />
      <span className="text-sm font-medium text-white">
        {formatBalance(amount, token.decimals, { keepZero: false, precision: 4 })} {symbol}
      </span>
    </div>
  ) : null;
}

function Address({ address }: { address: Address }) {
  return (
    <div className="inline-block w-24 truncate">
      <PrettyAddress address={address} forceShort className="text-sm font-medium text-primary" />
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <span className="text-sm font-medium text-white">{text}</span>;
}
