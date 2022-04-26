import { useContext } from 'react';
import { DepartureContext, DepartureCtx } from '../providers/departure-provider';

export const useDeparture = () => useContext(DepartureContext) as Exclude<DepartureCtx, null>;
