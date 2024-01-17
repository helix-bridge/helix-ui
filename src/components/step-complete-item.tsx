import { BridgeCategory, ChainConfig, Token } from "@/types";
import PrettyAddress from "./pretty-address";
import Image from "next/image";
import { formatBalance, getChainLogoSrc, getTokenLogoSrc } from "@/utils";
import { Address } from "viem";

export default function StepCompleteItem({
  property,
  address,
  bridge,
  chain,
  token,
  balance,
  percent,
}: {
  property: string;
  address?: Address;
  bridge?: BridgeCategory;
  chain?: ChainConfig;
  token?: Token;
  balance?: bigint;
  percent?: number;
}) {
  return (
    <div className="flex flex-col items-start gap-small">
      <span className="text-sm font-extrabold text-white/50">{property}</span>
      {!!address && <PrettyAddress address={address} forceShort className="text-sm font-medium text-white" />}
      {!!bridge && (
        <span className="text-sm font-medium text-white">
          {bridge === "lnv3" ? "LnBridgeV3" : "lnv2-opposite" ? "Opposite" : "Default"}
        </span>
      )}
      {!!chain && (
        <div className="flex items-center gap-small">
          <Image
            width={16}
            height={16}
            alt="Chain"
            src={getChainLogoSrc(chain.logo)}
            className="shrink-0 rounded-full"
          />
          <span className="hidden truncate text-sm font-medium text-white lg:inline">{chain.name}</span>
        </div>
      )}
      {!!token && balance ? (
        <span className="truncate text-sm font-medium text-white">{formatBalance(balance, token.decimals)}</span>
      ) : null}
      {!!token && !balance && (
        <div className="flex items-center gap-small">
          <Image
            width={16}
            height={16}
            alt="Token"
            src={getTokenLogoSrc(token.logo)}
            className="shrink-0 rounded-full"
          />
          <span className="hidden truncate text-sm font-medium text-white lg:inline">{token.symbol}</span>
        </div>
      )}
      {!!percent && <span className="text-sm font-medium text-white">{percent}%</span>}
    </div>
  );
}
