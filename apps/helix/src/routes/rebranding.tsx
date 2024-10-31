import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function Rebranding() {
  const location = useLocation();

  const href = useMemo(() => {
    let href = "https://app.helix.box";
    if (location.search) {
      href = `${href}/#${location.pathname}${location.search}`;
    } else if (location.pathname !== "/") {
      href = `${href}/#${location.pathname}`;
    }
    return href;
  }, [location.pathname, location.search]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="p-medium fixed left-0 top-0 flex w-full items-center justify-start lg:p-5">
        <img width={107} height={20} alt="Logo" src="images/logo.svg" />
      </div>

      <div className="p-medium flex max-w-[800px] flex-col items-center gap-5 lg:gap-8 lg:p-5">
        <img width={207.26} height={39} alt="Logo" src="images/helixbox-logo.svg" />
        <p className="text-center text-sm font-normal lg:text-base">
          Helix Bridge is excited to announce its rebranding as Helixbox Bridge, following the upgrade of the Helix
          brand to Helixbox. For all your cross-chain asset needs, visit our new platform at app.helix.box.
        </p>
        <a rel="noopener noreferrer" target="_blank" href={href} className="bg-primary group rounded-[10px] px-3 py-2">
          <span className="text-sm font-bold text-white underline-offset-4 group-hover:underline">
            Go to app.helix.box
          </span>
        </a>
      </div>
    </div>
  );
}
