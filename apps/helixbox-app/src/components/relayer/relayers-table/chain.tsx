import { Network } from "../../../types";
import Tooltip from "../../../ui/tooltip";
import { getChainConfig, getChainLogoSrc } from "../../../utils";

export default function Chain({ network }: { network: Network }) {
  const config = getChainConfig(network);
  return config ? (
    <Tooltip content={config.name} className="mx-auto w-fit">
      <img width={24} height={24} alt={config.name} src={getChainLogoSrc(config.logo)} className="rounded-full" />
    </Tooltip>
  ) : (
    <span>-</span>
  );
}
