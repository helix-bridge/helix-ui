import { useEffect, useState } from "react";

type BreakpointPrefix = "sm" | "md" | "lg" | "xl" | "2xl";

const mapping: Record<BreakpointPrefix, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * Check if media query matches. Refer to https://tailwindcss.com/docs/responsive-design
 * @param breakpoint "sm" | "md" | "lg" | "xl" | "2xl"
 * @returns boolean
 */
export function useMediaQuery(breakpoint: BreakpointPrefix) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${mapping[breakpoint]})`);
    setMatches(mql.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    mql.addEventListener("change", listener, false);

    return () => {
      mql.addEventListener("change", listener, false);
    };
  }, [breakpoint]);

  return matches;
}
