import { Record } from "@/types";
import PrettyAddress from "./pretty-address";
import { getTokenIcon } from "@/utils";
import Image from "next/image";
import { getChainConfig } from "helix.js";

interface Props {
  record?: Record | null;
}

export default function TokenToReceive({ record }: Props) {
  const icon = record?.recvToken ? getTokenIcon(record.recvToken) : "unknown.svg";
  const symbol = record?.recvToken || "Unknown";
  const address = record?.recvTokenAddress;
  const decimals = (record?.toChain ? getChainConfig(record.toChain) : undefined)?.tokens.find(
    (token) => token.symbol === symbol,
  );

  return address ? (
    <div className="gap-middle flex items-center">
      <PrettyAddress address={address} copyable className="text-primary text-sm font-normal" />
      <Image width={20} height={20} alt="Token" src={`/images/token/${icon}`} className="shrink-0" />
      <span className="text-sm font-normal text-white">{symbol}</span>

      {/* add to metamask */}
      {!!window.ethereum && (
        <button
          className="border-primary px-middle rounded border py-[1px] transition hover:opacity-80 active:translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={async () => {
            if (symbol && address && decimals) {
              try {
                await window.ethereum.request({
                  method: "wallet_watchAsset",
                  params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                      address,
                      symbol,
                      decimals,
                      image: "",
                    },
                  },
                });
              } catch (err) {
                console.error(err);
              }
            }
          }}
          disabled={!(symbol && address && decimals)}
        >
          <span className="text-sm font-normal text-white">Add to MetaMask</span>
        </button>
      )}
    </div>
  ) : null;
}
