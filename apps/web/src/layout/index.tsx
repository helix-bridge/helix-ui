import { useLocation } from "react-router-dom";
import AppLayout from "./app-layout";
import HomeLayout from "./home-layout";
import { useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.body.style.background = pathname === "/" || pathname === "/liquidity-solver" ? "#000a67" : "#00141d";
  }, [pathname]);
  return pathname === "/" || pathname === "/liquidity-solver" ? <HomeLayout /> : <AppLayout />;
}
