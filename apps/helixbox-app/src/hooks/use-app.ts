import { useContext } from "react";
import { AppContext } from "../providers/app-provider/context";

export const useApp = () => useContext(AppContext);
