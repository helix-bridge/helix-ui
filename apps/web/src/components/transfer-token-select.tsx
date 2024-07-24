import { TokenCategory, TokenSymbol } from "../types";
import { getTokenLogoSrc } from "../utils";
import { useState } from "react";

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

  return (
    <div className="gap-medium px-medium flex items-center">
      <TokenImage token={value} active />
      <span className="text-base font-bold text-white">{value.symbol}</span>
      <div className="gap-medium group ml-2 flex items-center">
        {options
          .filter((option) => option.symbol !== value.symbol)
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
