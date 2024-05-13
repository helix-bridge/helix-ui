import { PropsWithChildren, useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="app-footer flex w-full items-center justify-center px-medium lg:justify-between lg:px-5">
      <span className="text-xs font-semibold text-white/50">{`© ${new Date().getFullYear()} Helix Bridge`}</span>

      <div className="hidden items-center gap-5 lg:flex">
        <Link
          className="text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95"
          to="/records"
        >
          Explorer
        </Link>
        <a
          className="text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95"
          href="https://xtoken.box"
          rel="noopener noreferrer"
          target="_blank"
        >
          xToken
        </a>
        <a
          className="text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95"
          href="https://docs.helixbridge.app/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Docs
        </a>

        {mainnetOrTestnet && (
          <a
            className="text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95"
            href={mainnetOrTestnet.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {mainnetOrTestnet.label}
          </a>
        )}

        <div className="h-3 w-[1px] bg-white/30" />

        <Social href="https://github.com/helix-bridge">
          <img width={16} height={16} alt="Github" src="images/social/github.svg" />
        </Social>
        <Social href="https://twitter.com/helixbridges">
          <img width={16} height={16} alt="Twitter" src="images/social/twitter.svg" />
        </Social>
        <Social href="https://discord.gg/6XyyNGugdE">
          <img width={20} height={20} alt="Discord" src="images/social/discord.svg" />
        </Social>
        <Social href="mailto:hello@helixbridge.app">
          <img width={16} height={16} alt="Email" src="images/social/email.svg" />
        </Social>
      </div>
    </div>
  );
}

function Social({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="hidden opacity-60 transition hover:-translate-y-[2px] hover:opacity-100 active:translate-y-0 lg:inline"
    >
      {children}
    </a>
  );
}
