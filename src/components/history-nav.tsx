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
      className="inline-flex h-8 items-center rounded-full bg-white/20 px-large text-sm font-bold text-white hover:underline"
    >
      History
    </Link>
  ) : null;
}
