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
      className="rounded-[0.625rem] bg-white/20 px-medium py-small text-sm font-bold text-white transition-colors hover:bg-white/[0.25]"
    >
      History
    </Link>
  ) : null;
}
