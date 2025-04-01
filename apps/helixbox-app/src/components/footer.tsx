import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Tooltip from "../ui/tooltip";

export default function Footer() {
  return (
    <div className="app-footer gap-medium px-medium flex w-full items-center justify-center lg:justify-between lg:px-5">
      <span className="text-xs font-semibold text-white/50">{`© ${new Date().getFullYear()} Helixbox Team`}</span>
      <div className="h-3 w-[1px] bg-white/30 lg:hidden" />
      <div className="flex items-center gap-5">
        <Links />
        <div className="hidden h-3 w-[1px] bg-white/30 lg:block" />
        <Social />
      </div>
    </div>
  );
}

function Links() {
  interface TData {
    label: string;
    path: string;
    pc?: boolean;
    external?: boolean;
  }

  const data: TData[] = [
    { label: "Explorer", path: "/explorer" },
    { label: "XToken", path: "https://xtoken.helixbox.ai", external: true },
    { label: "Docs", path: "https://docs.helixbox.ai", external: true },
  ];
  const [network, setNetwork] = useState<TData>({ label: "Saa", path: "ss", pc: true, external: true });

  useEffect(() => {
    if (window.location.hostname === "app.helixbox.ai") {
      setNetwork((prev) => ({ ...prev, label: "Testnet", path: "https://testnet-app.helixbox.ai" }));
    } else if (window.location.hostname === "testnet-app.helixbox.ai") {
      setNetwork((prev) => ({ ...prev, label: "Mainnet", path: "https://app.helixbox.ai" }));
    } else if (window.location.hostname === "helixbox-stg-mainnet.vercel.app") {
      setNetwork((prev) => ({ ...prev, label: "Testnet", path: "https://helixbox-stg-testnet.vercel.app" }));
    } else if (window.location.hostname === "helixbox-stg-testnet.vercel.app") {
      setNetwork((prev) => ({ ...prev, label: "Mainnet", path: "https://helixbox-stg-mainnet.vercel.app" }));
    } else if (window.location.hostname === "helixbox-dev-mainnet.vercel.app") {
      setNetwork((prev) => ({ ...prev, label: "Testnet", path: "https://helixbox-dev-testnet.vercel.app" }));
    } else if (window.location.hostname === "helixbox-dev-testnet.vercel.app") {
      setNetwork((prev) => ({ ...prev, label: "Mainnet", path: "https://helixbox-dev-mainnet.vercel.app" }));
    } else {
      setNetwork((prev) => ({ ...prev, label: "", path: "" }));
    }
  }, []);

  return (
    <div className="gap-medium flex items-center lg:gap-5">
      {data
        .concat(network)
        .filter((d) => d.path)
        .map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95 ${item.pc ? "hidden lg:inline" : ""}`}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className={`text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95 ${item.pc ? "hidden lg:inline" : ""}`}
            >
              {item.label}
            </Link>
          ),
        )}

      {window.location.hostname === "app.helixbox.ai" && (
        <Tooltip
          contentClassName="w-72"
          className="inline-flex items-center"
          content="For a fully decentralized experience, you can use the IPFS deployed version."
        >
          <a
            href="https://helixbridge.eth.limo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs font-semibold text-white/50 transition hover:text-white hover:underline active:scale-95 lg:inline"
          >
            IPFS mirror
          </a>
        </Tooltip>
      )}
    </div>
  );
}

function Social() {
  const data = [
    {
      link: "https://github.com/helix-bridge",
      icon: <img width={16} height={16} alt="Github" src="images/social/github.svg" />,
    },
    {
      link: "https://x.com/HelixboxLabs",
      icon: <img width={16} height={16} alt="X" src="images/social/x.svg" />,
    },
    {
      link: "https://discord.gg/6XyyNGugdE",
      icon: <img width={20} height={20} alt="Discord" src="images/social/discord.svg" />,
    },
    {
      link: "mailto:hello@helixbox.ai",
      icon: <img width={16} height={16} alt="Email" src="images/social/email.svg" />,
    },
  ];

  return (
    <div className="hidden items-center gap-5 lg:flex">
      {data.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 transition hover:-translate-y-[2px] hover:opacity-100 active:translate-y-0"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
