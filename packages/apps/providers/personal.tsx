import { createContext, useContext, useState } from 'react';

interface PersonalCtx {
  isPersonalHistoryVisible: boolean;
  setIsPersonalHistoryVisible: (bool: boolean) => void;
}

export const PersonalContext = createContext<PersonalCtx | null>(null);

export const usePersonal = () => useContext(PersonalContext) as Exclude<PersonalCtx, null>;

export const PersonalProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [isPersonalHistoryVisible, setIsPersonalHistoryVisible] = useState(false);

  return (
    <PersonalContext.Provider value={{ isPersonalHistoryVisible, setIsPersonalHistoryVisible }}>
      {children}
    </PersonalContext.Provider>
  );
};
