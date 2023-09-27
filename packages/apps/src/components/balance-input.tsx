import { ChainToken } from "@/types/cross-chain";
import { formatBalance } from "@/utils/balance";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import Image from "next/image";
import { parseUnits } from "viem";

export interface BalanceInputValue {
  formatted: bigint;
  value: string;
}

export function BalanceInput({
  balance,
  value,
  chainToken,
  onChange = () => undefined,
}: {
  balance?: bigint;
  value?: BalanceInputValue;
  chainToken: ChainToken;
  onChange?: (value: BalanceInputValue) => void;
}) {
  const chainConfig = getChainConfig(chainToken.network);
  const tokenConfig = chainConfig?.tokens.find((t) => t.symbol === chainToken.symbol);

  const insufficient = balance && (value?.formatted || 0n) > balance ? true : false;

  return (
    <div
      className={`p-small lg:p-middle gap-small bg-app-bg flex items-center justify-between rounded border transition-colors ${
        insufficient
          ? "hover:border-app-red focus-within:border-app-red border-app-red"
          : "hover:border-line focus-within:border-line border-transparent"
      }`}
    >
      <input
        placeholder={
          balance && tokenConfig
            ? `Balance ${formatBalance(balance, tokenConfig.decimals, { keepZero: false })}`
            : "Enter an amount"
        }
        className="h-12 w-full rounded bg-transparent text-sm font-medium text-white focus-visible:outline-none"
        onChange={(e) => {
          if (e.target.value) {
            if (!Number.isNaN(Number(e.target.value)) && tokenConfig) {
              onChange({ value: e.target.value, formatted: parseUnits(e.target.value, tokenConfig.decimals) });
            }
          } else {
            onChange({ value: e.target.value, formatted: 0n });
          }
        }}
        value={value?.value}
      />

      {chainConfig && tokenConfig ? (
        <div className="p-middle gap-middle flex items-center">
          <div className="relative w-fit">
            <Image
              width={30}
              height={30}
              alt="Token"
              src={getTokenLogoSrc(tokenConfig.logo)}
              className="rounded-full"
            />
            <Image
              width={16}
              height={16}
              alt="Chain"
              src={getChainLogoSrc(chainConfig.logo)}
              className="absolute -bottom-1 -right-1 rounded-full"
            />
          </div>
          <span className="text-sm font-medium text-white">{tokenConfig.symbol}</span>
        </div>
      ) : null}
    </div>
  );
}