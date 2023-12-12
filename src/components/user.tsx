import { useApp, useBalances } from "@/hooks";
import { UrlSearchParamKey } from "@/types";
import Dropdown from "@/ui/dropdown";
import { formatBalance, getChainLogoSrc, getTokenLogoSrc, toShortAdrress } from "@/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { useAccount, useDisconnect } from "wagmi";
import PrettyAddress from "./pretty-address";
import AddressIdenticon from "./address-identicon";
import { Placement } from "@floating-ui/react";

interface Props {
  placement: Placement;
  prefixLength?: number;
  suffixLength?: number;
  onComplete?: () => void;
}

export default function User({ placement, prefixLength = 10, suffixLength = 8, onComplete = () => undefined }: Props) {
  const { setRecordsSearch } = useApp();

  const { address } = useAccount();
  const { balances } = useBalances(address);
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return address ? (
    <Dropdown
      childClassName="bg-inner py-large rounded-large border border-component flex flex-col gap-large"
      labelClassName="user-connect-wallet"
      placement={placement}
      label={<LabelSpan>{toShortAdrress(address)}</LabelSpan>}
    >
      <div className="flex items-center gap-middle px-5">
        <AddressIdenticon address={address} diameter={32} />
        <PrettyAddress
          forceShort
          prefixLength={prefixLength}
          suffixLength={suffixLength}
          address={address}
          copyable
          className="text-sm font-extrabold text-white"
        />
      </div>

      <div className="flex items-center gap-small px-5">
        <Link
          href={`/records?${UrlSearchParamKey.ADDRESS}=${address}`}
          onClick={() => {
            setRecordsSearch(address);
            onComplete();
          }}
          className="user-dropdown-item"
        >
          <Image width={18} height={18} alt="History" src="/images/history.svg" className="shrink-0" />
          <ChildSpan>History</ChildSpan>
        </Link>
        <button onClick={() => disconnect()} className="user-dropdown-item">
          <Image width={18} height={18} alt="Disconnect" src="/images/disconnect.svg" className="shrink-0" />
          <ChildSpan>Disconnect</ChildSpan>
        </button>
      </div>

      <div className="mx-5 h-[1px] bg-white/10" />

      <div className="flex max-h-[40vh] flex-col gap-large overflow-y-auto px-5 lg:max-h-[70vh]">
        {balances
          .filter(({ balance }) => 0 < balance)
          .map((balance) => (
            <div key={`${balance.chain.network}-${balance.token.symbol}`} className="flex items-center gap-large">
              <div className="relative">
                <Image
                  alt="Token"
                  width={32}
                  height={32}
                  src={getTokenLogoSrc(balance.token.logo)}
                  className="rounded-full"
                />
                <Image
                  alt="Chain"
                  width={20}
                  height={20}
                  src={getChainLogoSrc(balance.chain.logo)}
                  className="absolute -bottom-1 -right-1 rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  {formatBalance(balance.balance, balance.token.decimals)} {balance.token.symbol}
                </span>
                <span className="text-xs font-medium text-white/50">{balance.chain.name}</span>
              </div>
            </div>
          ))}
      </div>
    </Dropdown>
  ) : (
    <button className="user-connect-wallet" onClick={openConnectModal}>
      <LabelSpan>Connect Wallet</LabelSpan>
    </button>
  );
}

function LabelSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-base font-medium text-white">{children}</span>;
}

function ChildSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-sm font-medium">{children}</span>;
}
