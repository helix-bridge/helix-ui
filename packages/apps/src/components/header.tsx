"use client";

import { useToggle } from "@/hooks";
import Tooltip from "@/ui/tooltip";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Drawer = dynamic(() => import("@/ui/drawer"), { ssr: false });

const navigationsConfig: { label: string; href: string }[] = [
  { href: "/apps", label: "Transfer" },
  { href: "/explorer", label: "Explorer" },
  { href: "/b", label: "Docs" },
];

export default function Header() {
  const [isDrawerOpen, _, setDrawerOpen, setDrawerClose] = useToggle(false);
  const pathName = usePathname();

  return (
    <>
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
                content={
                  <span className="text-xs font-light">Helix is in beta. Please use at your own risk level</span>
                }
                className="w-fit"
              >
                <Image width={35} height={18} alt="Beta" src="/images/beta.svg" />
              </Tooltip>
            </div>

            {/* navigations */}
            {navigationsConfig.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hidden rounded-lg px-3 py-1 text-base font-medium transition hover:bg-white/10 active:translate-y-1 lg:inline"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* right */}
          {pathName === "/apps" && (
            <button className="px-middle bg-primary hover:bg-primary/90 hidden h-[30px] shrink-0 items-center justify-center rounded transition active:translate-y-1 lg:inline-flex">
              <span className="text-sm font-normal">Connect Wallet</span>
            </button>
          )}
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
        <div className="flex h-96 w-full flex-col gap-10">
          <div className="gap-large flex w-full flex-col items-center">
            {navigationsConfig.map(({ label, href }) => (
              <Link key={label} href={href} className="font-semibold hover:underline">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            {pathName === "/apps" && (
              <button className="px-large bg-primary inline-flex h-8 shrink-0 items-center justify-center rounded transition active:translate-y-1">
                <span className="text-sm font-semibold">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        <div />
      </Drawer>
    </>
  );
}
