import { HistoryRecord } from "../types/graphql";
import PrettyAddress from "./pretty-address";
import { getTokenLogoSrc } from "../utils/misc";
import { getChainConfig } from "../utils/chain";
import Button from "../ui/button";

interface Props {
  record?: HistoryRecord | null;
}

export default function TokenToReceive({ record }: Props) {
  const token = getChainConfig(record?.toChain)?.tokens.find(
    ({ symbol, address }) =>
      symbol === record?.recvToken ||
      (record?.recvTokenAddress && address.toLowerCase() === record.recvTokenAddress?.toLowerCase()),
  );

  return token ? (
    <div className="gap-medium flex items-center">
      {token.type !== "native" && (
        <PrettyAddress address={token.address} copyable className="text-primary text-sm font-medium" />
      )}
      <img width={20} height={20} alt="Token" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
      <span className="text-sm font-medium text-white">{token.symbol}</span>

      {/* add to metamask */}
      {window.ethereum && token.type !== "native" ? (
        <Button
          className="rounded-medium px-medium py-[1px]"
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
          <span className="text-sm font-medium text-white">Add to MetaMask</span>
        </Button>
      ) : null}
    </div>
  ) : null;
}
