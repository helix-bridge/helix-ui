import { RelayerContext } from "../providers/relayer-provider/context";
import { useContext } from "react";

export const useRelayer = () => useContext(RelayerContext);
