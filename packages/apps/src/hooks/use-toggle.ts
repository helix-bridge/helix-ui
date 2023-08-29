import { useCallback, useState } from "react";

export function useToggle(initValue: boolean) {
  const [state, setState] = useState(initValue);

  const toggleState = useCallback(() => setState((prev) => !prev), []);
  const setStateToTrue = useCallback(() => setState(true), []);
  const setStateToFalse = useCallback(() => setState(false), []);

  return [state, toggleState, setStateToTrue, setStateToFalse] as [boolean, () => void, () => void, () => void];
}
