"use client";

import { useToggle } from "@/hooks";
import Tooltip from "@/ui/tooltip";
import { isProduction } from "@/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ChainSwitch = dynamic(() => import("@/components/chain-switch"), { ssr: false });
const HistoryNav = dynamic(() => import("@/components/history-nav"), { ssr: false });
const User = dynamic(() => import("@/components/user"), { ssr: false });
const Drawer = dynamic(() => import("@/ui/drawer"), { ssr: false });

interface NavigationConfig {
  label: string;
  href: string;
  external?: boolean;
  soon?: boolean;
  disabled?: boolean;
}

const navigationsConfig: NavigationConfig[] = [
  { href: "/", label: "Transfer" },
  { href: "/relayer", label: "Relayer" },
];

export default function Header() {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const pathname = usePathname();

  return (
    <>
      <div className="app-header fixed left-0 top-0 z-10 w-full border-b border-b-white/25 bg-app-bg lg:border-b-transparent">
        <div className="mx-auto flex h-full max-w-8xl items-center justify-between px-medium">
          {/* Left */}
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="flex items-center gap-medium">
              <Link href="/">
                <Image width={90} height={25} alt="Logo" src="/images/logo.svg" />
              </Link>
              {!isProduction() && (
                <div className="inline-flex items-center justify-center rounded-small bg-primary px-1 py-[1px]">
                  <span className="text-xs font-bold text-black">testnet</span>
                </div>
              )}
            </div>

            {/* Navigations */}
            <div className="hidden items-center gap-medium lg:flex">
              {navigationsConfig.map(({ href, label, external, soon, disabled }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className={`rounded-[0.625rem] px-medium py-small text-sm font-bold transition-colors hover:bg-white/[0.15] ${
                      pathname === href ? "text-primary underline" : "text-white"
                    }`}
                  >
                    {label}
                  </a>
                ) : soon || disabled ? (
                  <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                    <span className="rounded-[0.625rem] px-medium py-small text-sm font-bold text-white/50">
                      {label}
                    </span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    className={`rounded-[0.625rem] px-medium py-small text-sm font-bold transition-colors hover:bg-white/[0.15] ${
                      pathname === href ? "text-primary underline decoration-2 underline-offset-8" : "text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Right */}
          <div className="hidden items-center gap-medium lg:flex">
            <HistoryNav />
            <User prefixLength={14} suffixLength={10} />
            <ChainSwitch />
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
        <div className="flex w-full items-start justify-center" style={{ marginTop: "20%" }}>
          <div className="flex w-max flex-col items-start gap-10">
            <div className="flex flex-col gap-large">
              {navigationsConfig.map(({ label, href, external, soon, disabled }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className={`text-sm font-bold ${
                      pathname === href ? "text-primary underline decoration-2 underline-offset-4" : "text-white"
                    }`}
                  >
                    {label}
                  </a>
                ) : soon || disabled ? (
                  <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                    <span className="text-sm font-bold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    className={`text-sm font-bold ${
                      pathname === href ? "text-primary underline decoration-2 underline-offset-4" : "text-white"
                    }`}
                    onClick={setIsOpenFalse}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>

            <div className="flex flex-col gap-medium">
              <ChainSwitch />
              <User placement="bottom" onComplete={setIsOpenFalse} />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
