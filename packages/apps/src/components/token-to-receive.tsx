import { Record } from "@/types/graphql";
import PrettyAddress from "./pretty-address";
import Image from "next/image";
import { getTokenLogoSrc } from "@/utils/misc";
import { getChainConfig } from "@/utils/chain";

interface Props {
  record?: Record | null;
}

export default function TokenToReceive({ record }: Props) {
  const token = getChainConfig(record?.toChain)?.tokens.find(
    ({ symbol, address }) =>
      symbol === record?.recvToken ||
      (record?.recvTokenAddress && address.toLowerCase() === record.recvTokenAddress?.toLowerCase()),
  );

  return token ? (
    <div className="gap-middle flex items-center">
      {token.address && <PrettyAddress address={token.address} copyable className="text-primary text-sm font-normal" />}
      <Image width={20} height={20} alt="Token" src={getTokenLogoSrc(token.logo)} className="shrink-0" />
      <span className="text-sm font-normal text-white">{token.symbol}</span>

      {/* add to metamask */}
      {!!(window.ethereum && token.address) && (
        <button
          className="border-primary px-middle rounded border py-[1px] transition hover:opacity-80 active:translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={async () => {
            try {
              await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                  type: "ERC20", // Initially only supports ERC20, but eventually more!
                  options: {
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    image: "",
                  },
                },
              });
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <span className="text-sm font-normal text-white">Add to MetaMask</span>
        </button>
      )}
    </div>
  ) : null;
}