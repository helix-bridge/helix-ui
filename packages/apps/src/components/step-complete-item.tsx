import { BridgeCategory } from "@/types/bridge";
import { Network } from "@/types/chain";
import { ChainToken } from "@/types/cross-chain";
import { getChainConfig } from "@/utils/chain";
import PrettyAddress from "./pretty-address";
import Image from "next/image";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import { formatBalance } from "@/utils/balance";

export default function StepCompleteItem({
  property,
  address,
  bridge,
  network,
  chainToken,
  balance,
  percent,
}: {
  property: string;
  address?: string;
  bridge?: BridgeCategory;
  network?: Network;
  chainToken?: ChainToken;
  balance?: bigint;
  percent?: number;
}) {
  const chainConfig = getChainConfig(network);
  const token = getChainConfig(chainToken?.network)?.tokens.find((t) => t.symbol === chainToken?.symbol);

  return (
    <div className="gap-small flex flex-col items-start">
      <span className="text-sm font-normal text-white/50">{property}</span>
      {!!address && <PrettyAddress address={address} forceShort className="text-sm font-normal text-white" />}
      {!!bridge && (
        <span className="text-sm font-normal text-white">
          {bridge === "lnbridgev20-opposite" ? "Opposite" : "Default"}
        </span>
      )}
      {!!chainConfig && (
        <div className="gap-small flex items-center">
          <Image
            width={16}
            height={16}
            alt="Chain"
            src={getChainLogoSrc(chainConfig.logo)}
            className="shrink-0 rounded-full"
          />
          <span className="truncate text-sm font-normal text-white">{chainConfig.name}</span>
        </div>
      )}
      {!!token && balance ? (
        <span className="truncate text-sm font-normal text-white">
          {formatBalance(balance, token.decimals, { keepZero: false })}
        </span>
      ) : null}
      {!!token && !balance && (
        <div className="gap-small flex items-center">
          <Image
            width={16}
            height={16}
            alt="Token"
            src={getTokenLogoSrc(token.logo)}
            className="shrink-0 rounded-full"
          />
          <span className="text-sm font-normal text-white">{token.symbol}</span>
        </div>
      )}
      {!!percent && <span className="text-sm font-normal text-white">{percent}%</span>}
    </div>
  );
}
