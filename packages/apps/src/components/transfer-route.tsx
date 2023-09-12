import Tooltip from "@/ui/tooltip";
import { getBridgeConfig, getChainConfig } from "@/utils";
import { BridgeCategory, Network } from "helix.js";
import Image from "next/image";

interface Props {
  bridge?: BridgeCategory;
  fromChain?: Network;
  toChain?: Network;
}

export default function TransferRoute({ bridge, fromChain, toChain }: Props) {
  const fromChainConfig = getChainConfig(fromChain);
  const toChainConfig = getChainConfig(toChain);
  const bridgeConfig = getBridgeConfig(bridge);

  return (
    <div className="gap-middle flex items-center">
      <ChainIcon logo={fromChainConfig?.logo || "unknown.png"} name={fromChainConfig?.name || "Unknown"} />
      <CaretRight />
      <Tooltip content={<span className="text-xs font-normal text-white">{bridgeConfig?.name || "Unknown"}</span>}>
        <Image width={64} height={64} alt="Bridge" src={`/images/bridge/${bridgeConfig?.logo || "unknown.svg"}`} />
      </Tooltip>
      <CaretRight />
      <ChainIcon logo={toChainConfig?.logo || "unknown.png"} name={toChainConfig?.name || "Unknown"} />
    </div>
  );
}

function ChainIcon({ logo, name }: { logo: string; name: string }) {
  return (
    <Tooltip content={<span className="text-xs font-normal text-white">{name}</span>} className="shrink-0">
      <Image width={40} height={40} alt={name} src={`/images/network/${logo}`} />
    </Tooltip>
  );
}

function CaretRight() {
  return <Image width={9} height={12} alt="Caret right" src="/images/caret-right.svg" className="shrink-0" />;
}
