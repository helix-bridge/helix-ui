import { RelayerContext } from "../providers/relayer-provider";
import { useContext } from "react";

export const useRelayer = () => useContext(RelayerContext);
