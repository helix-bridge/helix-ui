import { createContext, useState } from 'react';
import { ChainConfig } from '../model';

export interface DepartureState {
  from?: ChainConfig;
  sender?: string;
}

export interface DepartureCtx {
  departure: DepartureState;
  updateDeparture: (data: DepartureState) => void;
}

export const DepartureContext = createContext<DepartureCtx | null>(null);

export const DepartureProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [departure, updateDeparture] = useState<DepartureState>({});

  return <DepartureContext.Provider value={{ departure, updateDeparture }}>{children}</DepartureContext.Provider>;
};
