"use client";

import { useToggle } from "@/hooks/use-toggle";
import Tooltip from "@/ui/tooltip";
import { isProduction } from "@/utils/env";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const User = dynamic(() => import("@/components/user"), { ssr: false });
const Drawer = dynamic(() => import("@/ui/drawer"), { ssr: false });

interface NavigationConfig {
  label: string;
  href: string;
  external?: boolean;
  soon?: boolean;
}

export default function Header() {
  const [isDrawerOpen, _, setDrawerOpen, setDrawerClose] = useToggle(false);
  const pathname = usePathname();

  const navigationsConfig = useMemo<NavigationConfig[]>(() => {
    if (pathname.startsWith("/relayer")) {
      return [
        { href: "/relayer/overview", label: "Overview" },
        { href: "/relayer/dashboard", label: "Dashboard" },
      ];
    } else {
      return [
        { href: "/", label: "Transfer" },
        { href: "/records", label: "Explorer" },
        { href: "/relayer/overview", label: "Relayer" },
        { href: "https://docs.helixbridge.app/", label: "Docs", external: true },
      ];
    }
  }, [pathname]);

  return (
    <>
      <div className="app-header bg-app-bg border-b-line fixed left-0 top-0 z-10 w-full border-b lg:border-b-transparent">
        <div className="px-middle container mx-auto flex h-full items-center justify-between">
          {/* left */}
          <div className="flex items-center gap-5">
            {/* logo */}
            <div className="gap-middle flex items-center">
              <Link href="/">
                <Image width={90} height={25} alt="Logo" src="/images/logo.svg" />
              </Link>
              <Tooltip
                content={
                  <span className="text-xs font-light">Helix is in beta. Please use at your own risk level</span>
                }
                className="w-fit"
                enabled={isProduction()}
              >
                <div className="bg-primary inline-flex items-center justify-center rounded-sm px-1 py-[1px]">
                  <span className="text-xs font-bold text-black">{isProduction() ? "beta" : "testnet"}</span>
                </div>
              </Tooltip>
            </div>

            {/* navigations */}
            <div className="gap-middle hidden items-center lg:flex">
              {navigationsConfig.map(({ href, label, external, soon }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className="rounded-lg px-3 py-1 text-base font-medium transition hover:bg-white/10 active:translate-y-1"
                  >
                    {label}
                  </a>
                ) : soon ? (
                  <Tooltip key={label} content={<span className="text-xs font-normal text-white">Coming soon</span>}>
                    <span className="rounded-lg px-3 py-1 text-base font-medium text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    className="rounded-lg px-3 py-1 text-base font-medium transition hover:bg-white/10 active:translate-y-1"
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* right */}
          <User className="px-large hover:bg-primary/90 gap-middle hidden h-8 items-center justify-center lg:inline-flex" />
          <Image
            width={24}
            height={24}
            alt="Menu"
            src="/images/menu.svg"
            className="inline transition-transform active:translate-y-1 lg:hidden"
            onClick={setDrawerOpen}
          />
        </div>
      </div>

      <Drawer maskClosable isOpen={isDrawerOpen} onClose={setDrawerClose}>
        <div className="flex h-96 w-full items-start justify-center">
          <div className="flex w-max flex-col items-start gap-10">
            <div className="gap-large flex flex-col">
              {navigationsConfig.map(({ label, href, external, soon }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className="font-semibold hover:underline"
                  >
                    {label}
                  </a>
                ) : soon ? (
                  <Tooltip key={label} content={<span className="text-xs font-normal text-white">Coming soon</span>}>
                    <span className="font-semibold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link key={label} href={href} className="font-semibold hover:underline" onClick={setDrawerClose}>
                    {label}
                  </Link>
                ),
              )}
            </div>

            <User
              className="px-large gap-middle inline-flex h-9 items-center justify-center"
              onClose={setDrawerClose}
            />
          </div>
        </div>

        <div />
      </Drawer>
    </>
  );
}
