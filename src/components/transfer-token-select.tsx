import { Token } from "@/types";
import { getTokenLogoSrc } from "@/utils";
import Image from "next/image";
import { useState } from "react";

interface Props {
  value: Token;
  options: Token[];
  onChange?: (value: Token) => void;
}

export default function TransferTokenSelect({ value, options, onChange }: Props) {
  const [hoveIndex, setHoverIndex] = useState(-1);

  return (
    <div className="flex items-center gap-medium">
      <TokenImage token={value} active />
      <span className="text-base font-bold text-white">{value.symbol}</span>
      <div className="group flex items-center gap-medium">
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
  token: Token;
  index?: number;
  active?: boolean;
  hoveIndex?: number;
  onClick?: (token: Token) => void;
  onHoverChange?: (index: number) => void;
}) {
  return (
    <Image
      width={30}
      height={30}
      alt="Token image"
      src={getTokenLogoSrc(token.logo)}
      className={`h-[1.875rem] w-[1.875rem] shrink-0 rounded-full transition-[transform,opacity] duration-200 ${
        active
          ? "opacity-100"
          : `${index <= hoveIndex ? "group-active:-translate-x-2" : ""} opacity-50 hover:cursor-pointer`
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
