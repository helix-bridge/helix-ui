import { useApp } from "@/hooks";
import { UrlSearchParamKey } from "@/types";
import Dropdown from "@/ui/dropdown";
import { toShortAdrress } from "@/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { useAccount, useDisconnect } from "wagmi";

interface Props {
  onComplete?: () => void;
}

export default function User({ onComplete = () => undefined }: Props) {
  const { setRecordsSearch } = useApp();

  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return address ? (
    <Dropdown
      childClassName="bg-inner lg:bg-component py-middle flex flex-col rounded-middle"
      labelClassName="user-connect-wallet"
      label={<LabelSpan>{toShortAdrress(address)}</LabelSpan>}
      sameWidth
    >
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
