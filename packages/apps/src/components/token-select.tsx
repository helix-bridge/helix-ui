import { getChainConfig, getTokenIcon } from "@/utils";
import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { Network, TokenSymbol } from "helix.js";
import Image from "next/image";
import { useRef, useState } from "react";

export interface Value {
  network: Network;
  symbol: TokenSymbol;
}

export interface Item {
  network: Network;
  symbols: TokenSymbol[];
}

interface Props {
  items: Item[];
  value?: Value;
  onSelect?: (value: Value) => void;
}

export default function TokenSelect({ items, value, onSelect = () => undefined }: Props) {
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
  const tokenIcon = value ? getTokenIcon(value.symbol) : "unknown.svg";

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
              src={`/images/token/${tokenIcon}`}
              className="rounded-full"
            />
            <Image
              width={16}
              height={16}
              alt="Network logo"
              src={`/images/network/${chainConfig?.logo || "unknown.png"}`}
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
              <Cascader items={items} onSelect={onSelect} />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function Cascader({ items, onSelect }: { items: Item[]; onSelect: (value: Value) => void }) {
  const [symbols, setSymbols] = useState<TokenSymbol[]>([]);
  const networkRef = useRef<Network | null>();

  return (
    <div className="flex">
      {/* left */}
      <div className="pr-small flex h-60 flex-1 flex-col overflow-y-auto border-r border-r-white/20">
        {items.map(({ network, symbols }) => {
          const chainConfig = getChainConfig(network);
          return (
            <div
              key={network}
              className="px-small lg:px-middle flex items-center justify-between rounded py-[2px] transition-colors hover:cursor-pointer hover:bg-white/10"
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
                  src={`/images/network/${chainConfig?.logo || "unknown.png"}`}
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
      <div className="pl-small h-60 flex-1 overflow-y-auto">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className="gap-small px-small lg:px-middle flex w-full items-center rounded py-[2px] hover:bg-white/10"
            onClick={() => networkRef.current && onSelect({ network: networkRef.current, symbol })}
          >
            <Image
              width={16}
              height={16}
              alt="Token icon"
              src={`/images/token/${getTokenIcon(symbol)}`}
              className="rounded-full"
            />
            <span className="text-sm font-light">{symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
