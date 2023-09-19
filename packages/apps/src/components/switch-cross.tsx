import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import { ButtonHTMLAttributes } from "react";

export default function SwitchCross({ disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Tooltip content={<span className="text-xs font-normal text-white">Currently unavailable</span>} enabled={disabled}>
      <button
        className="transition hover:scale-105 hover:opacity-80 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-100"
        disabled={disabled}
        {...rest}
      >
        <Image width={36} height={36} alt="Switch" src="/images/switch.svg" />
      </button>
    </Tooltip>
  );
}
