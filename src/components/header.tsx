import { useToggle } from "../hooks";
import Tooltip from "../ui/tooltip";
import { isTestnet } from "../utils";
import { Link, useLocation } from "react-router-dom";
import History from "./history";
import User from "./user";
import ChainSwitch from "./chain-switch";
import Drawer from "../ui/drawer";

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
  const { pathname } = useLocation();

  return (
    <>
      <div
        className={`app-header fixed left-0 top-0 z-10 flex w-full items-center justify-between border-b border-b-white/25 px-medium lg:border-b-transparent lg:px-5 ${
          pathname === "/" ? "backdrop-blur lg:bg-transparent lg:backdrop-blur-none" : "bg-background"
        }`}
      >
        {/* Left */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div className="flex items-center gap-medium">
            <Link to="/">
              <img width={90} height={25} alt="Logo" src="images/logo.svg" />
            </Link>
            {isTestnet() && (
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
                  className="rounded-full px-3 py-small text-sm font-bold transition-colors hover:bg-white/[0.15]"
                >
                  {label}
                </a>
              ) : soon || disabled ? (
                <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                  <span className="rounded-full px-3 py-small text-sm font-bold text-white/50">{label}</span>
                </Tooltip>
              ) : (
                <Link
                  key={label}
                  to={href}
                  className={`relative rounded-full px-3 py-small text-sm font-bold transition-colors hover:bg-white/[0.15] ${
                    pathname === href
                      ? "text-primary after:absolute after:-bottom-[2px] after:left-1/4 after:block after:h-[3px] after:w-1/2 after:rounded-full after:bg-primary"
                      : "text-white"
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
          <History className="inline-flex h-8 items-center rounded-full bg-secondary px-large text-sm font-bold text-white transition-colors hover:bg-white/20" />
          <User prefixLength={14} suffixLength={10} />
          <ChainSwitch placement="bottom-end" />
        </div>
        <img
          width={24}
          height={24}
          alt="Menu"
          src="images/menu.svg"
          className="inline transition-transform active:translate-y-1 lg:hidden"
          onClick={setIsOpenTrue}
        />
      </div>

      <Drawer maskClosable isOpen={isOpen} onClose={setIsOpenFalse}>
        <div className="flex w-full items-start justify-center" style={{ marginTop: "20%" }}>
          <div className="flex w-max flex-col items-start gap-10">
            <div className="flex flex-col gap-large">
              {navigationsConfig.map(({ label, href, external, soon, disabled }) =>
                external ? (
                  <a rel="noopener noreferrer" target="_blank" href={href} key={label} className="text-sm font-bold">
                    {label}
                  </a>
                ) : soon || disabled ? (
                  <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                    <span className="text-sm font-bold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    className={`relative text-sm font-bold ${
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
