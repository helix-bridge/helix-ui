import { RelayerContext } from "../providers/relayer-provider-v3";
import { useContext } from "react";

export const useRelayerV3 = () => useContext(RelayerContext);
