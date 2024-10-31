import { BridgeCategory, ChainConfig, Token } from "../types";
import PrettyAddress from "./pretty-address";
import { formatBalance, getChainLogoSrc, getTokenLogoSrc } from "../utils";
import { Address } from "viem";

export default function StepCompleteItem({
  property,
  address,
  bridge,
  chain,
  token,
  balance,
  percent,
  className,
}: {
  property: string;
  address?: Address;
  bridge?: BridgeCategory;
  chain?: ChainConfig;
  token?: Token;
  balance?: bigint;
  percent?: number;
  className?: string;
}) {
  return (
    <div className={`gap-small flex-col items-start ${className ?? "flex"}`}>
      <span className="text-sm font-semibold text-white/50">{property}</span>
      {!!address && <PrettyAddress address={address} forceShort className="text-sm font-semibold text-white" />}
      {!!bridge && (
        <span className="text-sm font-semibold text-white">
          {bridge === "lnv3" ? "LnBridgeV3" : bridge === "lnv2-opposite" ? "Opposite" : "Default"}
        </span>
      )}
      {!!chain && (
        <div className="gap-small flex items-center">
          <img width={18} height={18} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
          <span className="truncate text-sm font-semibold text-white">{chain.name}</span>
        </div>
      )}
      {!!token && balance ? (
        <span className="truncate text-sm font-semibold text-white">{formatBalance(balance, token.decimals)}</span>
      ) : null}
      {!!token && !balance && (
        <div className="gap-small flex items-center">
          <img width={18} height={18} alt="Token" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
          <span className="truncate text-sm font-semibold text-white">{token.symbol}</span>
        </div>
      )}
      {!!percent && <span className="text-sm font-semibold text-white">{percent}%</span>}
    </div>
  );
}
