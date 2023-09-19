import { useCallback, useState } from "react";

export function useToggle(initValue: boolean) {
  const [state, setState] = useState(initValue);

  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);

  return [state, toggle, setTrue, setFalse] as [boolean, () => void, () => void, () => void];
}