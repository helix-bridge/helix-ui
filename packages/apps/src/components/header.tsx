"use client";

import Tooltip from "@/ui/tooltip";
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
            <Tooltip
              content={<span className="text-xs font-light">Helix is in beta. Please use at your own risk level</span>}
              className="w-fit"
            >
              <Image width={35} height={18} alt="Beta" src="/images/beta.svg" />
            </Tooltip>
          </div>

          {/* nav */}
          <Nav href="/apps">Transfer</Nav>
          <Nav href="/b">Explorer</Nav>
          <Nav href="/c">Docs</Nav>
        </div>

        {/* right */}
        {pathName === "/apps" && (
          <button className="px-middle bg-primary hover:bg-primary/90 inline-flex h-[30px] shrink-0 items-center justify-center rounded transition active:translate-y-1">
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
      className="rounded-lg px-3 py-1 text-base font-medium transition hover:bg-white/10 active:translate-y-1"
    >
      {children}
    </Link>
  );
}
