"use client";

import { useToggle } from "@/hooks";
import Tooltip from "@/ui/tooltip";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const User = dynamic(() => import("@/components/user"), { ssr: false });
const Drawer = dynamic(() => import("@/ui/drawer"), { ssr: false });

const navigationsConfig: { label: string; href: string; external?: boolean }[] = [
  { href: "/", label: "Transfer" },
  { href: "/records", label: "Explorer" },
  { href: "https://docs.helixbridge.app/", label: "Docs", external: true },
];

export default function Header() {
  const [isDrawerOpen, _, setDrawerOpen, setDrawerClose] = useToggle(false);

  return (
    <>
      <div className="fixed left-0 top-0 z-10 w-full">
        <div className="app-header px-middle container mx-auto flex items-center justify-between">
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
              >
                <Image width={35} height={18} alt="Beta" src="/images/beta.svg" />
              </Tooltip>
            </div>

            {/* navigations */}
            <div className="gap-middle hidden items-center lg:flex">
              {navigationsConfig.map(({ href, label, external }) =>
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
          <User className="px-middle hover:bg-primary/90 gap-middle hidden h-[30px] items-center justify-center lg:inline-flex" />
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
            {navigationsConfig.map(({ label, href, external }) =>
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
              ) : (
                <Link key={label} href={href} className="font-semibold hover:underline" onClick={setDrawerClose}>
                  {label}
                </Link>
              ),
            )}
          </div>

          <div className="flex justify-center">
            <User
              className="px-large gap-middle inline-flex h-8 items-center justify-center"
              onClose={setDrawerClose}
            />
          </div>
        </div>

        <div />
      </Drawer>
    </>
  );
}
