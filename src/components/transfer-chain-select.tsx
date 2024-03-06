import { ChainConfig, Token } from "@/types";
import Select from "@/ui/select";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils";
import Image from "next/image";

interface Props {
  chain: ChainConfig;
  token: Token;
  chainOptions: ChainConfig[];
  tokenOptions: Token[];
  onChainChange?: (chain: ChainConfig) => void;
  onTokenChange?: (token: Token) => void;
}

export default function TransferChainSelect({
  chain,
  token,
  chainOptions,
  tokenOptions,
  onChainChange,
  onTokenChange,
}: Props) {
  return (
    <div className="flex items-center gap-medium">
      <Select
        placeholder={<span className="text-base font-bold text-slate-400">Select a chain</span>}
        label={
          <div className="flex items-center gap-medium">
            <Image
              width={30}
              height={30}
              alt="Chain"
              src={getChainLogoSrc(chain.logo)}
              className="h-[1.875rem] w-[1.875rem] shrink-0 rounded-full"
            />
            <span className="text-base font-bold text-white">{chain.name}</span>
          </div>
        }
        labelClassName="flex items-center justify-between gap-small w-full"
        childClassName="flex flex-col gap-medium p-medium rounded-[0.625rem] bg-[#00141D]"
        sameWidth
      >
        {chainOptions.length ? (
          chainOptions.map((option) => (
            <ChainOption key={option.id} selected={chain} option={option} onSelect={onChainChange} />
          ))
        ) : (
          <div className="inline-flex justify-center py-small">
            <span className="text-sm font-bold text-slate-400">No data</span>
          </div>
        )}
      </Select>

      {tokenOptions.length > 1 ? (
        <Select
          placeholder={<span className="text-sm font-bold text-slate-400">Select a token</span>}
          label={
            <div className="flex items-center gap-small">
              <Image
                width={24}
                height={24}
                alt="Token"
                src={getTokenLogoSrc(token.logo)}
                className="h-[1.5rem] w-[1.5rem] shrink-0 rounded-full"
              />
              <span className="text-sm font-bold text-white">{token.symbol}</span>
            </div>
          }
          labelClassName="flex items-center justify-between gap-small p-small rounded-[0.625rem] bg-[#1F282C] w-[7.5rem]"
          childClassName="flex flex-col gap-medium p-small rounded-[0.625rem] bg-[#00141D]"
          sameWidth
        >
          {tokenOptions.map((option) => (
            <TokenOption key={option.symbol} selected={token} option={option} onSelect={onTokenChange} />
          ))}
        </Select>
      ) : null}
    </div>
  );
}

function ChainOption({
  selected,
  option,
  onSelect = () => undefined,
}: {
  selected: ChainConfig;
  option: ChainConfig;
  onSelect?: (chain: ChainConfig) => void;
}) {
  return (
    <button
      className={`flex items-center gap-medium rounded-[0.625rem] p-medium transition-colors ${
        selected.id === option.id ? "bg-white/20" : "bg-[#1F282C] hover:cursor-pointer hover:bg-white/20"
      }`}
      disabled={selected.id === option.id}
      onClick={() => {
        onSelect(option);
      }}
    >
      <Image
        width={30}
        height={30}
        alt="Chain"
        src={getChainLogoSrc(option.logo)}
        className="h-[1.875rem] w-[1.875rem] shrink-0 rounded-full"
      />
      <span className="text-sm font-bold text-white">{option.name}</span>
    </button>
  );
}

function TokenOption({
  selected,
  option,
  onSelect = () => undefined,
}: {
  selected: Token;
  option: Token;
  onSelect?: (token: Token) => void;
}) {
  return (
    <button
      className={`flex items-center gap-small rounded-[0.625rem] p-small transition-colors ${
        selected.symbol === option.symbol ? "bg-white/20" : "bg-[#1F282C] hover:cursor-pointer hover:bg-white/20"
      }`}
      disabled={selected.symbol === option.symbol}
      onClick={() => {
        onSelect(option);
      }}
    >
      <Image
        width={24}
        height={24}
        alt="Chain"
        src={getTokenLogoSrc(option.logo)}
        className="h-[1.5rem] w-[1.5rem] shrink-0 rounded-full"
      />
      <span className="text-xs font-bold text-white">{option.name}</span>
    </button>
  );
}
