"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-main flex items-center justify-center">
      <div className="flex w-fit flex-col items-start gap-medium">
        <h2 className="text-base font-medium text-white">Oops, something went wrong !</h2>
        <button
          onClick={reset}
          className="rounded px-large py-small text-sm font-normal text-white transition-colors hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
