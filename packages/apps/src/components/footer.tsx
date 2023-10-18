"use client";

import Image from "next/image";
import { PropsWithChildren, useEffect, useState } from "react";

export default function Footer() {
  const [mainnetOrTestnet, setMainnetOrTestnet] = useState<{ label: "Mainnet" | "Testnet"; link: string }>();

  // useEffect(() => {
  //   if (window.location.hostname === "helixbridge.app") {
  //     setMainnetOrTestnet({ label: "Testnet", link: "https://helix-apps-test.vercel.app" });
  //   } else if (window.location.hostname === "helix-apps-test.vercel.app") {
  //     setMainnetOrTestnet({ label: "Mainnet", link: "https://helixbridge.app" });
  //   } else if (window.location.hostname === "helix-stg.vercel.app") {
  //     setMainnetOrTestnet({ label: "Testnet", link: "https://helix-stg-test.vercel.app" });
  //   } else if (window.location.hostname === "helix-stg-test.vercel.app") {
  //     setMainnetOrTestnet({ label: "Mainnet", link: "https://helix-stg.vercel.app" });
  //   } else if (window.location.hostname === "helix-v2.vercel.app") {
  //     setMainnetOrTestnet({ label: "Mainnet", link: "https://helixbridge.app" });
  //   }
  // }, []);

  useEffect(() => {
    if (window.location.hostname === "helix-v2.vercel.app") {
      setMainnetOrTestnet({ label: "Testnet", link: "https://helix-v2-test.vercel.app" });
    } else if (window.location.hostname === "helix-v2-test.vercel.app") {
      setMainnetOrTestnet({ label: "Mainnet", link: "https://helix-v2.vercel.app" });
    }
  }, []);

  return (
    <div className="app-footer bg-app-bg w-full">
      <div className="px-middle container mx-auto flex h-full shrink-0 items-center justify-center lg:justify-between">
        {/* copyright */}
        <span className="text-sm font-light text-white/50">{`© ${new Date().getFullYear()} Helix Bridge`}</span>

        {/* social links */}
        <div className="gap-middle flex shrink-0 items-center lg:gap-5">
          <SocialLink href="https://github.com/helix-bridge">
            <Image width={18} height={18} alt="Github" src="/images/social/github.svg" />
          </SocialLink>
          <SocialLink href="https://twitter.com/helixbridges">
            <Image width={18} height={18} alt="Twitter" src="/images/social/twitter.svg" />
          </SocialLink>
          <SocialLink href="mailto:hello@helixbridge.app">
            <Image width={18} height={18} alt="Email" src="/images/social/email.svg" />
          </SocialLink>

          {mainnetOrTestnet && (
            <>
              <div className="block lg:hidden" />
              <div className="h-4 w-[1px] bg-white/30" />

              <a
                className="text-sm font-light text-white/50 transition hover:text-white/80 active:scale-95"
                href={mainnetOrTestnet.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {mainnetOrTestnet.label}
              </a>
            </>
          )}
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
