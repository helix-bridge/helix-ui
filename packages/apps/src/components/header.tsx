"use client";

import { useToggle } from "@/hooks";
import Tooltip from "@/ui/tooltip";
import { isProduction } from "@/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const ChainIdentity = dynamic(() => import("@/components/chain-identity"), { ssr: false });
const User = dynamic(() => import("@/components/user"), { ssr: false });
const Drawer = dynamic(() => import("@/ui/drawer"), { ssr: false });

interface NavigationConfig {
  label: string;
  href: string;
  external?: boolean;
  soon?: boolean;
}

export default function Header() {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
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
      <div className="app-header bg-app-bg fixed left-0 top-0 z-10 w-full border-b border-b-white/25 lg:border-b-transparent">
        <div className="px-middle container mx-auto flex h-full items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="gap-middle flex items-center">
              <Link href="/">
                <Image width={90} height={25} alt="Logo" src="/images/logo.svg" />
              </Link>
              <Tooltip
                content="Helix is in beta. Please use at your own risk level"
                className="w-fit"
                enabled={isProduction()}
              >
                <div className="bg-primary rounded-small inline-flex items-center justify-center px-1 py-[1px]">
                  <span className="text-xs font-bold text-black">{isProduction() ? "beta" : "testnet"}</span>
                </div>
              </Tooltip>
            </div>

            {/* Navigations */}
            <div className="gap-middle hidden items-center lg:flex">
              {navigationsConfig.map(({ href, label, external, soon }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className={`rounded-middle px-3 py-1 text-base font-bold transition hover:bg-white/10 active:translate-y-1 ${
                      pathname === href ? "text-primary underline" : "text-white"
                    }`}
                  >
                    {label}
                  </a>
                ) : soon ? (
                  <Tooltip key={label} content="Coming soon">
                    <span className="rounded-middle px-3 py-1 text-base font-bold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    className={`rounded-middle px-3 py-1 text-base font-bold transition-all hover:bg-white/10 active:translate-y-1 ${
                      pathname === href ? "text-primary underline underline-offset-8" : "text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Right */}
          <div className="gap-middle hidden items-center lg:flex">
            <ChainIdentity />
            <User />
          </div>
          <Image
            width={24}
            height={24}
            alt="Menu"
            src="/images/menu.svg"
            className="inline transition-transform active:translate-y-1 lg:hidden"
            onClick={setIsOpenTrue}
          />
        </div>
      </div>

      <Drawer maskClosable isOpen={isOpen} onClose={setIsOpenFalse}>
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
                    className={`text-base font-semibold ${
                      pathname === href ? "text-primary underline underline-offset-4" : "text-white"
                    }`}
                  >
                    {label}
                  </a>
                ) : soon ? (
                  <Tooltip key={label} content="Coming soon">
                    <span className="text-base font-semibold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    className={`text-base font-semibold ${
                      pathname === href ? "text-primary underline underline-offset-4" : "text-white"
                    }`}
                    onClick={setIsOpenFalse}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>

            <User onComplete={setIsOpenFalse} />
          </div>
        </div>

        <div />
      </Drawer>
    </>
  );
}
