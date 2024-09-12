import { useRegisterSW } from "virtual:pwa-register/react";
import Button from "../ui/button";

const isPWA = window.matchMedia("(display-mode: standalone)").matches;
const enableReload = false;

export default function PWABadge() {
  // Periodic sync is disabled, change the value to enable it, the period is in milliseconds
  // You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    setNeedRefresh(false);
  }

  return (
    <div role="alert" aria-labelledby="toast-message">
      {needRefresh && isPWA && enableReload && (
        <div className="bg-background fixed bottom-0 right-0 z-10 m-4 flex flex-col gap-y-3 rounded-xl border border-white/20 p-3 text-left">
          <span id="toast-message" className="text-sm font-bold text-white">
            New content available, click on reload button to update.
          </span>
          <div className="flex items-center justify-end gap-x-3">
            <Button className="rounded-lg px-3 py-[0.125rem] text-sm font-bold" onClick={() => close()}>
              Close
            </Button>
            <Button
              className="rounded-lg px-3 py-[0.125rem] text-sm font-bold"
              onClick={() => updateServiceWorker(true)}
              kind="primary"
            >
              Reload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
