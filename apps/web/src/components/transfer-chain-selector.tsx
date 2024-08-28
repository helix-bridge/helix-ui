import { useApp } from "../hooks";
import { ChainConfig, Token } from "../types";
import Select from "../ui/select";
import { formatBalance, getChainLogoSrc, getTokenLogoSrc } from "../utils";
import { useState } from "react";
import TransferChainSelect from "./transfer-chain-select";

interface Props {
  chain: ChainConfig;
  token: Token;
  chainOptions: ChainConfig[];
  tokenOptions: Token[];
  onChainChange?: (chain: ChainConfig) => void;
  onTokenChange?: (token: Token) => void;
}

export default function TransferChainSelector({
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
      <TransferChainSelect
        label={
          <>
            <img
              width={32}
              height={32}
              alt="Chain"
              src={getChainLogoSrc(chain.logo)}
              className="h-[2rem] w-[2rem] shrink-0 rounded-full"
            />
            <span className="truncate text-base font-bold text-white">{chain.name}</span>
          </>
        }
      >
        {chainOptions.length ? (
          <>
            <div className="mx-medium px-medium flex items-center gap-1 rounded-xl bg-white/5 transition-colors focus-within:bg-white/10 focus-within:outline-none hover:bg-white/10">
              <img alt="Search" width={24} height={24} src="images/search.svg" className="h-6 w-6 opacity-60" />
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
            <div className="app-scrollbar flex max-h-[17.2rem] flex-col overflow-y-auto">
              {chainOptions
                .filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()))
                .map((option) => (
                  <ChainOption
                    key={option.id}
                    selected={chain}
                    option={option}
                    token={token}
                    onSelect={onChainChange}
                  />
                ))}
            </div>
          </>
        ) : (
          <div className="py-medium flex justify-center">
            <span className="text-sm font-bold text-slate-400">No data</span>
          </div>
        )}
      </TransferChainSelect>

      {tokenOptions.length > 1 ? (
        <Select
          placeholder={<span className="text-sm font-bold text-slate-400">Select a token</span>}
          label={
            <div className="gap-small flex items-center">
              <img
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
  token,
  onSelect = () => undefined,
}: {
  selected: ChainConfig;
  option: ChainConfig;
  token: Token;
  onSelect?: (chain: ChainConfig) => void;
}) {
  const { balanceAll } = useApp();

  return (
    <button
      className="gap-small py-medium flex items-center justify-between px-5 transition-colors hover:bg-white/5 disabled:bg-white/10"
      disabled={selected.id === option.id}
      onClick={() => {
        onSelect(option);
      }}
    >
      <div className="gap-large flex items-center">
        <img
          width={30}
          height={30}
          alt="Chain"
          src={getChainLogoSrc(option.logo)}
          className="h-[1.875rem] w-[1.875rem] shrink-0 rounded-full"
        />
        <span className="truncate text-sm font-bold text-white">{option.name}</span>
      </div>

      {balanceAll
        .filter((b) => b.chain.id === option.id && b.token.category === token.category)
        .slice(0, 1)
        .map((b) => (
          <span
            className="truncate text-xs font-medium text-white/50"
            key={`${b.chain.network}-${b.token.symbol}`}
          >{`${formatBalance(b.balance, b.token.decimals, { precision: 6 })} ${b.token.symbol}`}</span>
        ))}
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
      className="gap-small p-small flex items-center rounded-[0.625rem] transition-colors hover:bg-white/5 disabled:bg-white/10"
      disabled={selected.symbol === option.symbol}
      onClick={() => {
        onSelect(option);
      }}
    >
      <img
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
