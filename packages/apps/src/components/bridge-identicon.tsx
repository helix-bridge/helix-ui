import { BaseBridge } from "@/bridges/base";
import { BridgeLogoType } from "@/types/bridge";
import Tooltip from "@/ui/tooltip";
import { getBridgeLogoSrc } from "@/utils/misc";
import Image from "next/image";

interface Props {
  width: number;
  height: number;
  type: BridgeLogoType;
  bridge?: BaseBridge;
}

export default function BridgeIdenticon({ width, height, type, bridge }: Props) {
  return bridge ? (
    <Tooltip content={bridge.getName()} className="w-fit">
      <Image
        width={width}
        height={height}
        alt="Bridge"
        src={getBridgeLogoSrc(type === "symbol" ? bridge.getLogo().symbol : bridge.getLogo().horizontal)}
        className="shrink-0 rounded-full"
      />
    </Tooltip>
  ) : null;
}
