import { ChainConfig, Token } from "@/types";
import Select from "@/ui/select";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { useState } from "react";

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
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center">
      <Select
        placeholder={<span className="text-base font-bold text-slate-400">Select a chain</span>}
        label={
          <div className="flex items-center gap-medium transition-transform group-hover:translate-x-2">
            <Image
              width={32}
              height={32}
              alt="Chain"
              src={getChainLogoSrc(chain.logo)}
              className="h-[2rem] w-[2rem] shrink-0 rounded-full"
            />
            <span className="truncate text-lg font-extrabold text-white">{chain.name}</span>
          </div>
        }
        labelClassName="flex items-center justify-between gap-small w-full mx-medium transition-colors hover:bg-white/10 group py-small rounded-[0.625rem]"
        childClassName="py-medium rounded-large bg-[#00141D] border border-white/20 flex flex-col gap-2"
        offsetSize={12}
        sameWidth
      >
        {chainOptions.length ? (
          <>
            <div className="mx-medium flex items-center gap-1 rounded-xl bg-[#1F282C] px-medium transition-colors focus-within:bg-white/20 focus-within:outline-none hover:bg-white/20">
              <Image alt="Search" width={24} height={24} src="/images/search.svg" className="h-6 w-6 opacity-60" />
              <input
                className="w-full bg-transparent py-2 text-base font-medium focus-visible:outline-none"
                placeholder="Search ..."
                value={search}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="mx-auto h-[1px] w-5 bg-white/50" />
            <div className="flex max-h-[17.2rem] flex-col overflow-y-auto">
              {chainOptions
                .filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()))
                .map((option) => (
                  <ChainOption key={option.id} selected={chain} option={option} onSelect={onChainChange} />
                ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center py-medium">
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
                width={26}
                height={26}
                alt="Token"
                src={getTokenLogoSrc(token.logo)}
                className="h-[1.625rem] w-[1.625rem] shrink-0 rounded-full"
              />
              <span className="truncate text-sm font-bold text-white">{token.symbol}</span>
            </div>
          }
          labelClassName="flex items-center justify-between gap-small px-small py-2 rounded-[0.625rem] bg-[#1F282C] w-[9.25rem] mr-medium transition-colors hover:bg-white/20"
          childClassName="flex flex-col gap-small p-small rounded-[0.625rem] bg-[#00141D] border border-white/20"
          offsetSize={12}
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
      className={`flex items-center gap-large px-5 py-medium transition-colors ${
        selected.id === option.id ? "bg-white/20" : "hover:bg-[#1F282C]"
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
      <span className="truncate text-base font-extrabold text-white">{option.name}</span>
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
      <span className="truncate text-sm font-bold text-white">{option.name}</span>
    </button>
  );
}
