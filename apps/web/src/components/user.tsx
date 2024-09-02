import { useApp } from "../hooks";
import Dropdown from "../ui/dropdown";
import { formatBalance, getChainLogoSrc, getTokenLogoSrc, toShortAdrress } from "../utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PropsWithChildren } from "react";
import { useAccount, useDisconnect } from "wagmi";
import PrettyAddress from "./pretty-address";
import AddressIdenticon from "./address-identicon";
import { Placement } from "@floating-ui/react";
import History from "./history";
import ComponentLoading from "../ui/component-loading";

interface Props {
  placement?: Placement;
  prefixLength?: number;
  suffixLength?: number;
  onComplete?: () => void;
}

export default function User({ placement, prefixLength = 10, suffixLength = 8 }: Props) {
  const { balanceAll, loadingBalanceAll } = useApp();

  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return address ? (
    <Dropdown
      childClassName="bg-background py-large rounded-large border border-white/20 flex flex-col gap-large"
      labelClassName={`flex items-center gap-2 rounded-xl bg-white/20 lg:bg-secondary px-large h-8 transition-colors hover:bg-white/20`}
      placement={placement}
      label={
        <div className="gap-small flex items-center">
          <AddressIdenticon address={address} diameter={20} />
          <span className="text-sm font-bold text-white">{toShortAdrress(address)}</span>
        </div>
      }
    >
      <div className="gap-medium flex items-center px-5">
        <AddressIdenticon address={address} diameter={32} />
        <PrettyAddress
          forceShort
          prefixLength={prefixLength}
          suffixLength={suffixLength}
          address={address}
          copyable
          disableTooltip
          className="text-sm font-extrabold text-white"
        />
      </div>

      <div className="gap-small flex items-center px-5">
        <History className="user-dropdown-item">
          <img width={18} height={18} alt="History" src="images/history.svg" className="shrink-0" />
          <ChildSpan>History</ChildSpan>
        </History>
        <button onClick={() => disconnect()} className="user-dropdown-item">
          <img width={18} height={18} alt="Disconnect" src="images/disconnect.svg" className="shrink-0" />
          <ChildSpan>Disconnect</ChildSpan>
        </button>
      </div>

      <div className="mx-5 h-[1px] bg-white/10" />

      <div className="relative flex max-h-[40vh] min-h-[2.5rem] flex-col overflow-y-auto px-2 lg:max-h-[72vh]">
        <ComponentLoading
          loading={loadingBalanceAll}
          color="white"
          size="small"
          className="bg-white/5 backdrop-blur-[2px]"
        />

        {balanceAll.filter(({ balance }) => 0 < balance).length ? (
          balanceAll
            .filter(({ balance }) => 0 < balance)
            .map((balance) => (
              <button
                key={`${balance.chain.network}-${balance.token.symbol}`}
                className="gap-large lg:py-medium flex items-center rounded-xl px-3 py-2 transition-colors hover:bg-white/10 disabled:cursor-default"
                disabled={true}
              >
                <div className="relative">
                  <img
                    alt="Token"
                    width={32}
                    height={32}
                    src={getTokenLogoSrc(balance.token.logo)}
                    className="rounded-full"
                  />
                  <img
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
            ))
        ) : !loadingBalanceAll ? (
          <div className="inline-flex h-10 items-center justify-center">
            <span className="text-sm font-medium text-slate-400">No data</span>
          </div>
        ) : null}
      </div>
    </Dropdown>
  ) : (
    <button
      className="bg-primary px-large hover:bg-primary/90 lg:py-small inline-flex rounded-xl py-2 transition-colors"
      onClick={openConnectModal}
    >
      <span className="text-sm font-bold text-white">Connect Wallet</span>
    </button>
  );
}

function ChildSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-sm font-medium">{children}</span>;
}
