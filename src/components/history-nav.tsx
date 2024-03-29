import { useApp } from "@/hooks";
import { UrlSearchParamKey } from "@/types";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function HistoryNav() {
  const { setRecordsSearch } = useApp();
  const { address } = useAccount();

  return address ? (
    <Link
      href={`/records?${UrlSearchParamKey.ADDRESS}=${address}`}
      onClick={() => setRecordsSearch(address)}
      className="user-connect-wallet text-sm font-bold text-white"
    >
      History
    </Link>
  ) : null;
}
