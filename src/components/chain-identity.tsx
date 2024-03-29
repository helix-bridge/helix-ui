import { getChainConfig, getChainLogoSrc } from "@/utils";
import Image from "next/image";
import { useNetwork } from "wagmi";

export default function ChainIdentity() {
  const { chain } = useNetwork();
  const config = getChainConfig(chain?.id);

  return chain ? (
    <div className="hidden h-8 max-w-[9rem] items-center gap-middle rounded-full border border-primary px-middle lg:flex">
      {config ? (
        <Image
          width={20}
          height={20}
          alt="Chain"
          src={getChainLogoSrc(config.logo)}
          className="shrink-0 rounded-full"
        />
      ) : null}
      <span className="truncate text-sm font-bold">{config?.name || chain.name}</span>
    </div>
  ) : null;
}
