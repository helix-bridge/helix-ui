import { useApp, useTransfer } from "@/hooks";
import { UrlSearchParamKey } from "@/types";
import Dropdown from "@/ui/dropdown";
import {
  formatBalance,
  getAvailableBridges,
  getAvailableTargetChains,
  getAvailableTargetTokens,
  getChainLogoSrc,
  getTokenLogoSrc,
  toShortAdrress,
} from "@/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { useAccount, useDisconnect } from "wagmi";
import PrettyAddress from "./pretty-address";
import AddressIdenticon from "./address-identicon";
import { Placement } from "@floating-ui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  placement: Placement;
  prefixLength?: number;
  suffixLength?: number;
  onComplete?: () => void;
}

export default function User({ placement, prefixLength = 10, suffixLength = 8, onComplete = () => undefined }: Props) {
  const { setBridgeCategory, setSourceChain, setTargetChain, setSourceToken, setTargetToken, updateUrlParams } =
    useTransfer();
  const { balances, setRecordsSearch } = useApp();

  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

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
          className="text-sm font-bold text-white"
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

      <div className="relative flex max-h-[40vh] flex-col overflow-y-auto px-2 lg:max-h-[72vh]">
        {balances
          .filter(({ balance }) => 0 < balance)
          .map((balance) => (
            <button
              key={`${balance.chain.network}-${balance.token.symbol}`}
              className="flex items-center gap-large rounded-2xl px-3 py-2 transition-colors hover:bg-white/10 disabled:cursor-default lg:py-middle"
              disabled={pathname !== "/"}
              onClick={() => {
                const _sourceChain = balance.chain;
                const _sourceToken = balance.token;
                const _targetChains = getAvailableTargetChains(_sourceChain);
                const _targetChain = _targetChains.at(0);
                const _targetTokens = getAvailableTargetTokens(_sourceChain, _targetChain, _sourceToken);
                const _targetToken = _targetTokens.at(0);
                const _category = getAvailableBridges(_sourceChain, _targetChain, _sourceToken).at(0);

                setBridgeCategory(_category);
                setSourceChain(_sourceChain);
                setTargetChain(_targetChain);
                setSourceToken(_sourceToken);
                setTargetToken(_targetToken);
                updateUrlParams(router, searchParams, {
                  _category,
                  _sourceChain,
                  _targetChain,
                  _sourceToken,
                  _targetToken,
                });
              }}
            >
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
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-white">
                  {formatBalance(balance.balance, balance.token.decimals)} {balance.token.symbol}
                </span>
                <span className="text-xs font-medium text-white/50">{balance.chain.name}</span>
              </div>
            </button>
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
  return <span className="text-sm font-bold text-white">{children}</span>;
}

function ChildSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-sm font-medium">{children}</span>;
}
