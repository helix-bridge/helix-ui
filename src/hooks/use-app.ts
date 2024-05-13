import { AppContext } from "../providers/app-provider";
import { useContext } from "react";

export const useApp = () => useContext(AppContext);
