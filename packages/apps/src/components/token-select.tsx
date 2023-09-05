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
  value: Value;
  onSelect?: (value: Value) => void;
}

export default function TokenSelect({ items, value, onSelect = () => undefined }: Props) {
  const chainConfig = getChainConfig(value.network);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10)],
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <>
      <button className="p-middle flex items-center justify-between" ref={refs.setReference} {...getReferenceProps()}>
        <div className="gap-middle flex items-center">
          <div className="relative w-fit">
            <Image width={30} height={30} alt="Token icon" src={`/images/token/${getTokenIcon(value.symbol)}`} />
            <Image
              width={16}
              height={16}
              alt="Network logo"
              src={`/images/network/${chainConfig?.logo || "unknown.png"}`}
              className="absolute bottom-0 right-0"
            />
          </div>

          <div className="gap-small flex flex-col">
            <span className="text-sm font-medium text-white">{value.symbol}</span>
            <span className="truncate text-xs font-light text-white">{chainConfig?.name || "Unknown"}</span>
          </div>
        </div>

        <Image
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="bg-component rounded"></div>
            <Cascader items={items} onSelect={onSelect} />
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
      <div className="flex h-60 flex-1 flex-col overflow-y-auto border-r border-r-white/30">
        {items.map(({ network, symbols }) => {
          const chainConfig = getChainConfig(network);
          return (
            <div
              key={network}
              className="flex items-center justify-between hover:cursor-pointer hover:bg-white/30"
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
                />
                <span>{chainConfig?.name || "Unknown"}</span>
              </div>
              <span>{`>`}</span>
            </div>
          );
        })}
      </div>

      {/* right */}
      <div className="h-60 flex-1 overflow-y-auto">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className="gap-small flex items-center"
            onClick={() => networkRef.current && onSelect({ network: networkRef.current, symbol })}
          >
            <Image width={16} height={16} alt="Token icon" src={`/images/token/${getTokenIcon(symbol)}`} />
            <span>{symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
