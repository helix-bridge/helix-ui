import { Record } from "@/types";
import Tooltip from "@/ui/tooltip";
import { formatBlanace, getChainConfig as getAppChainConfig, getTokenIcon } from "@/utils";
import { BaseBridge, Network, TokenSymbol, getChainConfig as getHelixjsChainConfig } from "helix.js";
import Image from "next/image";
import PrettyAddress from "./pretty-address";

interface Props {
  record?: Record | null;
  bridge?: BaseBridge | null;
}

export default function TokenTransfer({ record, bridge }: Props) {
  const bridgeContract = bridge?.getContract();

  return record && bridgeContract ? (
    <div className="flex flex-col items-start justify-between">
      <Item
        chain={record.fromChain}
        from={record.sender}
        to={bridgeContract.sourceAddress}
        symbol={record.sendToken}
        amount={BigInt(record.sendAmount || 0)}
      />
      <Item
        chain={record.toChain}
        from={bridgeContract.targetAddress}
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
  from: string;
  to: string;
  symbol: TokenSymbol;
  amount: bigint;
}) {
  const helixjsChainConfig = getHelixjsChainConfig(chain);
  const appChainConfig = getAppChainConfig(chain);

  const chainLogo = appChainConfig?.logo || "unknown.png";
  const chainName = appChainConfig?.name || "Unknown";

  const decimals = helixjsChainConfig?.tokens.find((token) => token.symbol === symbol)?.decimals;
  const tokenIcon = getTokenIcon(symbol);

  return decimals ? (
    <div className="gap-middle flex items-center">
      <Tooltip content={<span className="text-xs font-normal text-white">{chainName}</span>} className="shrink-0">
        <Image width={16} height={16} alt="Chain logo" src={`/images/network/${chainLogo}`} />
      </Tooltip>
      <span className="text-sm font-medium text-white">From</span>
      <PrettyAddress address={from} forceShort className="text-primary text-sm font-normal" />
      <span className="text-sm font-medium text-white">From</span>
      <PrettyAddress address={to} forceShort className="text-primary text-sm font-normal" />
      <span className="text-sm font-medium text-white">For</span>
      <Image width={16} height={16} alt="Token icon" src={`/images/token/${tokenIcon}`} className="shrink-0" />
      <span className="text-sm font-normal text-white">
        {formatBlanace(amount, decimals, { keepZero: false, precision: 4 })} {symbol}
      </span>
    </div>
  ) : null;
}
