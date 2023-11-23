import { ChainConfig } from "@/types/chain";
import { ChainToken, ChainTokens } from "@/types/misc";
import { Token } from "@/types/token";
import ISelect from "@/ui/i-select";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import { Placement } from "@floating-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";
import PrettyAddress from "./pretty-address";

interface Props {
  options: ChainTokens[];
  width: number;
  value?: ChainToken;
  placement?: Placement;
  onChange?: (value: ChainToken) => void;
}

export default function ChainTokenSelect({ options, value, width, placement, onChange = () => undefined }: Props) {
  return (
    <ISelect
      labelClassName="p-middle bg-app-bg flex shrink-0 items-center justify-between border-transparent"
      childClassName="bg-app-bg rounded border border-primary shadow-2xl"
      label={
        value ? (
          <div className="gap-middle lg:gap-large flex items-center">
            <div className="relative w-fit shrink-0">
              <Image
                width={36}
                height={36}
                alt="Token icon"
                src={getTokenLogoSrc(value.token.logo)}
                className="rounded-full"
              />
              <Image
                width={20}
                height={20}
                alt="Network logo"
                src={getChainLogoSrc(value.chain.logo)}
                className="absolute -bottom-1 -right-1 rounded-full"
              />
            </div>

            <div className="gap-small flex flex-col items-start truncate">
              <span className="text-sm font-medium text-white">{value.token.symbol}</span>
              <span className="text-xs font-medium text-white/60">{value.chain.name}</span>
            </div>
          </div>
        ) : undefined
      }
      placeholder={<span />}
      placement={placement}
    >
      <Cascader width={width} options={options} onChange={onChange} />
    </ISelect>
  );
}

function Cascader({
  options,
  width,
  onChange,
}: {
  width: number;
  options: ChainTokens[];
  onChange: (value: ChainToken) => void;
}) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const chainRef = useRef<ChainConfig>();

  return (
    <div className="py-small p-small lg:p-middle flex" style={{ width: width }}>
      {/* left */}
      <div
        className={`pr-small gap-small flex max-h-60 flex-1 flex-col overflow-y-auto border-r ${
          tokens.length ? "border-r-white/20" : "border-r-transparent"
        }`}
      >
        {options.map(({ chain, tokens }) => {
          return (
            <div
              key={chain.id}
              className="px-small lg:px-middle py-small border-radius flex items-center justify-between transition-colors hover:cursor-pointer hover:bg-white/10"
              onMouseEnter={() => {
                setTokens(tokens);
                chainRef.current = chain;
              }}
              onClick={(e) => {
                e.stopPropagation();
                setTokens(tokens);
                chainRef.current = chain;
              }}
            >
              <div className="gap-small flex items-center">
                <Image
                  width={16}
                  height={16}
                  alt="Network icon"
                  src={getChainLogoSrc(chain.logo)}
                  className="rounded-full"
                />
                <span className="text-sm">{chain.name}</span>
              </div>
              <span className="text-sm text-white/50">{`>`}</span>
            </div>
          );
        })}
      </div>

      {/* right */}
      <div className="pl-small max-h-60 flex-1 overflow-y-auto">
        {tokens.map((token) => {
          return (
            <button
              key={token.symbol}
              className="px-small lg:px-middle py-small border-radius flex w-full flex-col items-start hover:bg-white/10"
              onClick={() => {
                chainRef.current && onChange({ chain: chainRef.current, token });
              }}
            >
              <div className="gap-small flex items-center">
                <Image
                  width={16}
                  height={16}
                  alt="Token icon"
                  src={getTokenLogoSrc(token.logo)}
                  className="rounded-full"
                />
                <span className="text-sm">{token.symbol}</span>
              </div>
              {token.type === "native" ? (
                <span className="mt-1 text-xs text-white/50">Native token</span>
              ) : (
                <PrettyAddress address={token.address} copyable forceShort className="text-xs text-white/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
