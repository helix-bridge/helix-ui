import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc } from "@/utils/misc";
import Image from "next/image";
import { useNetwork } from "wagmi";

export default function ChainIdentity() {
  const { chain } = useNetwork();
  const config = getChainConfig(chain?.id);

  return chain ? (
    <div className="gap-middle bg-component px-middle border-primary hidden h-8 max-w-[8.5rem] items-center rounded-2xl border lg:flex">
      {!!config && (
        <Image
          width={20}
          height={20}
          alt="Chain"
          src={getChainLogoSrc(config.logo)}
          className="shrink-0 rounded-full"
        />
      )}
      <span className="truncate text-sm">{config?.name || chain.name}</span>
    </div>
  ) : null;
}
