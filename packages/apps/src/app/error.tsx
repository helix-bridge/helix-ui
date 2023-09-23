"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-main gap-middle flex flex-col items-center justify-center">
      <h2 className="text-base font-medium text-white">Oops, something went wrong !</h2>
      <button
        onClick={reset}
        className="px-large py-small rounded text-sm font-normal text-white transition-colors hover:bg-white/10"
      >
        Try again
      </button>
    </main>
  );
}
