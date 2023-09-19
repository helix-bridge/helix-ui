import { BaseBridge } from "@/bridges/base";
import { BridgeLogoType } from "@/types/bridge";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";

interface Props {
  width: number;
  height: number;
  type: BridgeLogoType;
  bridge?: BaseBridge;
  className?: string;
}

export default function BridgeLogo({ width, height, type, bridge, className }: Props) {
  return (
    <Tooltip
      content={<span className="text-xs font-normal text-white">{bridge?.getName() || "Unknown"}</span>}
      className="w-fit"
    >
      {bridge ? (
        <Image
          width={width}
          height={height}
          alt="Bridge"
          src={bridge.getLogoSrc(type)}
          className="shrink-0 rounded-full"
        />
      ) : (
        <div
          className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
          style={{ width, height }}
        >
          <span className="text-sm font-normal text-white">?</span>
        </div>
      )}
    </Tooltip>
  );
}
