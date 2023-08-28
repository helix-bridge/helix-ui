"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function Header() {
  const pathName = usePathname();

  return (
    <div className="fixed left-0 top-0 z-10 w-full">
      <div className="app-header px-middle container mx-auto flex items-center justify-between">
        {/* left */}
        <div className="gap-middle lg:gap-middle flex items-center">
          {/* logo */}
          <div className="gap-middle flex items-center">
            <Link href="/">
              <Image width={90} height={25} alt="Logo" src="/images/logo.svg" />
            </Link>
            <Image width={35} height={18} alt="Beta" src="/images/beta.svg" />
          </div>

          {/* nav */}
          <Nav href="/apps">Transfer</Nav>
          <Nav href="/b">Explorer</Nav>
          <Nav href="/c">Docs</Nav>
        </div>

        {/* right */}
        {pathName === "/apps" && (
          <button className="border-primary px-middle inline-flex h-[30px] shrink-0 items-center justify-center rounded border transition hover:opacity-80 active:scale-95">
            <span className="text-sm font-normal">Connect Wallet</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Nav({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1 text-base font-medium transition hover:bg-white/10 active:scale-95"
    >
      {children}
    </Link>
  );
}
