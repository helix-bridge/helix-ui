import Tooltip from "./tooltip";
import { ButtonHTMLAttributes } from "react";

export default function SwitchCrossIcon({ disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Tooltip content="This cross-chain is currently unavailable" enabled={disabled} className="shrink-0">
      <button
        className="shrink-0 rotate-90 transition hover:scale-105 hover:opacity-80 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-100"
        disabled={disabled}
        {...rest}
      >
        <img width={36} height={36} alt="Switch" src="images/switch.svg" />
      </button>
    </Tooltip>
  );
}
