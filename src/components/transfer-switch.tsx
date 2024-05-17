import Tooltip from "../ui/tooltip";
import { useState } from "react";

interface Props {
  disabled?: boolean;
  onSwitch?: () => void;
}

export default function TransferSwitch({ disabled, onSwitch = () => undefined }: Props) {
  const [switchCount, setSwitchCount] = useState(0);

  return (
    <div className="relative h-[2px] lg:h-[4px]">
      <Tooltip
        className={`absolute left-1/2 top-1/2 z-[9] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 transition-shadow hover:shadow-[0_0_16px_1px_rgba(255,255,255,.8)] ${
          disabled ? "opacity-60 hover:cursor-not-allowed" : "hover:cursor-pointer"
        }`}
        content="This cross-chain is currently unavailable"
        enabled={disabled === true}
      >
        <div
          className="transition-transform duration-300"
          style={{ transform: `rotateX(${180 * switchCount}deg)` }}
          onClick={() => {
            if (!disabled) {
              setSwitchCount((prev) => prev + 1);
              onSwitch();
            }
          }}
        >
          <img
            width={28}
            height={28}
            alt="Switch"
            src="images/switch.svg"
            className={`h-[1.75rem] w-[1.75rem] shrink-0 rounded-full transition-opacity ${
              disabled ? "opacity-60" : "opacity-80 hover:opacity-100"
            }`}
          />
        </div>
      </Tooltip>
    </div>
  );
}
