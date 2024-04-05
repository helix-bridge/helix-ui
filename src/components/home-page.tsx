import Image from "next/image";
import { PropsWithChildren } from "react";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="container flex flex-col items-center justify-center gap-12 px-middle lg:flex-row lg:justify-between lg:gap-middle">
        <div className="flex flex-col">
          <Image alt="Logo" width={210} height={56} src="/images/logo.svg" className="shrink-0" />
          <span className="mt-11 inline-block text-3xl font-bold text-white lg:w-[32.8rem]">
            Fully Open-Source and Decentralized Cross-Chain Asset Bridge
          </span>
          <span className="mt-5 inline-block text-sm font-normal text-white/60 lg:w-[36rem]">
            Built on top of common messaging bridges that already exist between chains, and provides secure, fast, and
            low-cost cross-chain functionality for users.
          </span>
        </div>
        <div className="flex items-center gap-8">
          <Card icon="/images/network/darwinia.png" link="https://bridge.darwinia.network" label="Darwinia" />
          <Card icon="/images/docs.png" link="https://docs.helixbridge.app" label="Docs" external />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center p-middle lg:justify-between lg:p-5">
        <span className="text-xs font-semibold text-white/50">{`© ${new Date().getFullYear()} Helix Bridge`}</span>
        <div className="hidden items-center gap-5 lg:flex">
          <Social href="https://github.com/helix-bridge">
            <Image width={16} height={16} alt="Github" src="/images/social/github.svg" />
          </Social>
          <Social href="https://twitter.com/helixbridges">
            <Image width={16} height={16} alt="Twitter" src="/images/social/twitter.svg" />
          </Social>
          <Social href="https://discord.gg/6XyyNGugdE">
            <Image width={20} height={20} alt="Discord" src="/images/social/discord.svg" />
          </Social>
          <Social href="mailto:hello@helixbridge.app">
            <Image width={16} height={16} alt="Email" src="/images/social/email.svg" />
          </Social>
        </div>
      </div>

      <div
        className="absolute -bottom-[90vw] left-0 h-[100vw] w-screen rounded-full opacity-40 blur-[6.15rem]"
        style={{
          background: "linear-gradient(#1859FF 100%, #0286FF 100%), linear-gradient(271deg, #1859FF 0%, #0286FF 100%)",
        }}
      />
    </main>
  );
}

function Card({ icon, link, label, external }: { icon: string; link: string; label: string; external?: boolean }) {
  return (
    <a
      className="group flex h-52 w-40 flex-col items-center justify-center gap-7 rounded-3xl bg-[#1F282C] transition-shadow hover:shadow-[0px_0px_40px_0px_rgba(0,133,255,0.50)]"
      target={external ? "_blank" : "_self"}
      href={link}
    >
      <Image alt={label} width={70} height={70} src={icon} className="shrink-0 rounded-full" />
      <div className="text-base font-bold text-white">
        <span>{label}</span>
        <span className="hidden group-hover:inline">&nbsp;{`>`}</span>
      </div>
    </a>
  );
}

function Social({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="opacity-60 transition-[transform,opacity] hover:scale-105 hover:opacity-100 active:scale-95"
    >
      {children}
    </a>
  );
}
