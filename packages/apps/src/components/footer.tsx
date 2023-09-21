import Image from "next/image";
import { PropsWithChildren } from "react";

export default function Footer() {
  return (
    <div className="bg-app-bg absolute bottom-0 left-0 z-10 w-full">
      <div className="app-footer px-middle container mx-auto flex shrink-0 items-center justify-center lg:justify-between">
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

          <div className="block lg:hidden" />
          <div className="h-4 w-[1px] bg-white/30" />

          <a
            className="text-sm font-light text-white/50 transition hover:text-white/80 active:scale-95"
            href=""
            rel="noopener noreferrer"
            target="_blank"
          >
            Mainnet
          </a>
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
