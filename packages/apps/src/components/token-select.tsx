import { Network } from "@/types/chain";
import { ChainToken, ChainTokens } from "@/types/cross-chain";
import { TokenSymbol } from "@/types/token";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";

interface Props {
  options: ChainTokens[];
  value?: ChainToken;
  onChange?: (value: ChainToken) => void;
}

export default function TokenSelect({ options, value, onChange = () => undefined }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(6)],
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const chainConfig = value && getChainConfig(value.network);
  const token = chainConfig?.tokens.find(({ symbol }) => symbol === value?.symbol);

  return (
    <>
      <button
        className="p-middle bg-component hover:border-line flex w-36 shrink-0 items-center justify-between rounded border border-transparent transition active:translate-y-1 lg:w-44"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div className="gap-middle flex items-center">
          <div className="relative w-fit shrink-0">
            <Image
              width={30}
              height={30}
              alt="Token icon"
              src={getTokenLogoSrc(token?.logo)}
              className="rounded-full"
            />
            <Image
              width={16}
              height={16}
              alt="Network logo"
              src={getChainLogoSrc(chainConfig?.logo)}
              className="absolute -bottom-1 -right-1 rounded-full"
            />
          </div>

          <div className="gap-small flex flex-col items-start truncate">
            <span className="text-sm font-medium text-white">{value?.symbol || "Unknown"}</span>
            <span className="text-xs font-light text-white/60">{chainConfig?.name || "Unknown"}</span>
          </div>
        </div>

        <Image
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
          className="shrink-0"
        />
      </button>

      {isMounted && (
        <FloatingPortal>
          <div
            style={floatingStyles}
            ref={refs.setFloating}
            {...getFloatingProps()}
            className="token-select-dropdown z-20"
          >
            <div style={styles} className="bg-component p-small lg:p-middle rounded border border-white/10 shadow-2xl">
              <Cascader options={options} onChange={onChange} onClose={setIsOpen} />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function Cascader({
  options,
  onChange,
  onClose,
}: {
  options: ChainTokens[];
  onChange: (value: ChainToken) => void;
  onClose: (isOpen: false) => void;
}) {
  const [symbols, setSymbols] = useState<TokenSymbol[]>([]);
  const networkRef = useRef<Network | null>();

  return (
    <div className="py-small flex">
      {/* left */}
      <div
        className={`pr-small gap-small flex flex-1 flex-col overflow-y-auto border-r ${
          symbols.length ? "border-r-white/20" : "border-r-transparent"
        }`}
      >
        {options.map(({ network, symbols }) => {
          const chainConfig = getChainConfig(network);
          return (
            <div
              key={network}
              className="px-small lg:px-middle py-small flex items-center justify-between rounded transition-colors hover:cursor-pointer hover:bg-white/10"
              onMouseEnter={() => {
                setSymbols(symbols);
                networkRef.current = network;
              }}
              // onMouseLeave={() => {
              //   setSymbols([]);
              //   networkRef.current = null;
              // }}
            >
              <div className="gap-small flex items-center">
                <Image
                  width={16}
                  height={16}
                  alt="Network icon"
                  src={getChainLogoSrc(chainConfig?.logo)}
                  className="rounded-full"
                />
                <span className="text-sm font-light">{chainConfig?.name || "Unknown"}</span>
              </div>
              <span className="text-sm font-light text-white/50">{`>`}</span>
            </div>
          );
        })}
      </div>

      {/* right */}
      <div className="pl-small flex-1 overflow-y-auto">
        {symbols.map((symbol) => {
          const token = getChainConfig(networkRef.current)?.tokens.find((t) => t.symbol === symbol);
          return (
            <button
              key={symbol}
              className="gap-small px-small lg:px-middle py-small flex w-full items-center rounded hover:bg-white/10"
              onClick={() => {
                networkRef.current && onChange({ network: networkRef.current, symbol });
                onClose(false);
              }}
            >
              <Image
                width={16}
                height={16}
                alt="Token icon"
                src={getTokenLogoSrc(token?.logo)}
                className="rounded-full"
              />
              <span className="text-sm font-light">{symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
