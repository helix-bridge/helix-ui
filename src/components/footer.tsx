"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useEffect, useState } from "react";

export default function Footer() {
  const [mainnetOrTestnet, setMainnetOrTestnet] = useState<{ label: "Mainnet" | "Testnet"; link: string }>();

  useEffect(() => {
    if (window.location.hostname === "helixbridge.app") {
      setMainnetOrTestnet({ label: "Testnet", link: "https://testnet.helixbridge.app" });
    } else if (window.location.hostname === "testnet.helixbridge.app") {
      setMainnetOrTestnet({ label: "Mainnet", link: "https://helixbridge.app" });
    } else if (window.location.hostname === "helix-stg.vercel.app") {
      setMainnetOrTestnet({ label: "Testnet", link: "https://helix-stg-test.vercel.app" });
    } else if (window.location.hostname === "helix-stg-test.vercel.app") {
      setMainnetOrTestnet({ label: "Mainnet", link: "https://helix-stg.vercel.app" });
    } else if (window.location.hostname === "helix-dev-main.vercel.app") {
      setMainnetOrTestnet({ label: "Testnet", link: "https://helix-dev-test.vercel.app" });
    } else if (window.location.hostname === "helix-dev-test.vercel.app") {
      setMainnetOrTestnet({ label: "Mainnet", link: "https://helix-dev-main.vercel.app" });
    }
  }, []);

  return (
    <div className="app-footer w-full">
      <div className="mx-auto flex h-full max-w-8xl shrink-0 items-center justify-center px-middle">
        {/* Copyright */}
        <span className="text-sm font-medium text-white/50">{`© ${new Date().getFullYear()} Helix Bridge`}</span>

        <div className="mx-3 h-4 w-[1px] bg-white/30 lg:mx-5 lg:bg-transparent" />

        <div className="flex shrink-0 items-center gap-middle lg:gap-5">
          <a
            className="text-sm font-medium text-white/50 transition hover:text-white active:scale-95"
            href="https://docs.helixbridge.app/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Docs
          </a>

          {mainnetOrTestnet && (
            <a
              className="text-sm font-medium text-white/50 transition hover:text-white active:scale-95"
              href={mainnetOrTestnet.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              {mainnetOrTestnet.label}
            </a>
          )}

          <div className="hidden h-4 w-[1px] bg-white/30 lg:block" />

          <SocialLink href="https://github.com/helix-bridge">
            <Image width={20} height={20} alt="Github" src="/images/social/github.svg" />
          </SocialLink>
          <SocialLink href="https://twitter.com/helixbridges">
            <Image width={20} height={20} alt="Twitter" src="/images/social/twitter.svg" />
          </SocialLink>
          <SocialLink href="https://discord.gg/6XyyNGugdE">
            <Image width={22} height={22} alt="Discord" src="/images/social/discord.svg" />
          </SocialLink>
          <SocialLink href="mailto:hello@helixbridge.app">
            <Image width={20} height={20} alt="Email" src="/images/social/email.svg" />
          </SocialLink>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="hidden opacity-60 transition hover:scale-105 hover:opacity-100 active:scale-95 lg:inline"
    >
      {children}
    </a>
  );
}
