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
    <div className="gap-small flex flex-col items-start">
      <span className="text-sm font-normal text-white/50">{property}</span>
      {!!address && <PrettyAddress address={address} forceShort className="text-sm font-normal text-white" />}
      {!!bridge && (
        <span className="text-sm font-normal text-white">
          {bridge === "lnbridgev20-opposite" ? "Opposite" : "Default"}
        </span>
      )}
      {!!chain && (
        <div className="gap-small flex items-center">
          <Image
            width={16}
            height={16}
            alt="Chain"
            src={getChainLogoSrc(chain.logo)}
            className="shrink-0 rounded-full"
          />
          <span className="hidden truncate text-sm font-normal text-white lg:inline">{chain.name}</span>
        </div>
      )}
      {!!token && balance ? (
        <span className="truncate text-sm font-normal text-white">{formatBalance(balance, token.decimals)}</span>
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
          <span className="hidden truncate text-sm font-normal text-white lg:inline">{token.symbol}</span>
        </div>
      )}
      {!!percent && <span className="text-sm font-normal text-white">{percent}%</span>}
    </div>
  );
}
