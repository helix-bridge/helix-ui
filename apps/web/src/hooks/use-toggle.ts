import { useCallback, useState } from "react";

export function useToggle(initValue: boolean) {
  const [state, setState] = useState(initValue);

  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  const toggle = useCallback(() => setState((prev) => !prev), []);

  return { state, toggle, setTrue, setFalse, setState };
}
