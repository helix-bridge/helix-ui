import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { TokenCategory, TokenSymbol } from "../types";
import { getTokenLogoSrc } from "../utils";
import { useMemo, useState } from "react";
import { safePolygon } from "@floating-ui/react";
import { useMediaQuery } from "../hooks";

interface Value {
  logo: string;
  category: TokenCategory;
  symbol: TokenSymbol;
}

interface Props {
  value: Value;
  options: Value[];
  onChange?: (value: Value) => void;
}

export default function TransferTokenSelect({ value, options, onChange }: Props) {
  const [hoveIndex, setHoverIndex] = useState(-1);

  const isPC = useMediaQuery("lg");
  const nonMoreTokensAmount = useMemo(() => (isPC ? 5 : 4), [isPC]);

  return (
    <div className="gap-medium px-medium flex items-center">
      <TokenImage token={value} active />
      <span className="text-base font-bold text-white">{value.symbol}</span>
      <div className="gap-medium group ml-2 flex items-center">
        {options
          .filter((option) => option.symbol !== value.symbol)
          .slice(0, nonMoreTokensAmount)
          .map((option, index) => (
            <TokenImage
              key={option.symbol}
              index={index}
              token={option}
              hoveIndex={hoveIndex}
              onClick={onChange}
              onHoverChange={setHoverIndex}
            />
          ))}
        {nonMoreTokensAmount + 1 < options.length && (
          <MoreTokens
            options={options.filter((option) => option.symbol !== value.symbol).slice(nonMoreTokensAmount)}
            onClick={onChange}
          />
        )}
      </div>
    </div>
  );
}

function TokenImage({
  token,
  active,
  index = 0,
  hoveIndex = -1,
  onClick = () => undefined,
  onHoverChange = () => undefined,
}: {
  token: Value;
  index?: number;
  active?: boolean;
  hoveIndex?: number;
  onClick?: (token: Value) => void;
  onHoverChange?: (index: number) => void;
}) {
  return (
    <img
      width={active ? 32 : 36}
      height={active ? 32 : 36}
      alt="Token image"
      src={getTokenLogoSrc(token.logo)}
      className={`shrink-0 rounded-full transition-[transform,opacity] duration-200 ${
        active
          ? "h-[2rem] w-[2rem] opacity-100"
          : `${
              index <= hoveIndex ? "group-active:-translate-x-2" : ""
            } h-[2.25rem] w-[2.25rem] opacity-50 hover:cursor-pointer hover:opacity-80`
      }`}
      onClick={() => {
        !active && onClick(token);
      }}
      onMouseEnter={() => {
        !active && onHoverChange(index);
      }}
      onMouseLeave={() => {
        !active && onHoverChange(-1);
      }}
    />
  );
}

function MoreTokens({ options, onClick = () => undefined }: { options: Value[]; onClick?: (token: Value) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4)],
  });
  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });
  const hover = useHover(context, { handleClose: safePolygon() });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  return (
    <>
      <img
        width={36}
        height={36}
        src={getTokenLogoSrc("more.svg")}
        alt="More tokens"
        className={`transition-opacity duration-200 hover:cursor-pointer hover:opacity-80 ${isOpen ? "opacity-80" : "opacity-50"}`}
        ref={refs.setReference}
        {...getReferenceProps()}
      />

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              className="bg-app-bg flex flex-col gap-2 rounded-xl border border-white/20 px-3 py-2"
              style={styles}
              onClick={() => setIsOpen(false)}
            >
              {options.map((option) => (
                <img
                  key={option.symbol}
                  width={36}
                  height={36}
                  src={getTokenLogoSrc(option.logo)}
                  className="rounded-full opacity-60 transition-opacity duration-200 hover:cursor-pointer hover:opacity-80"
                  onClick={() => onClick(option)}
                />
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
