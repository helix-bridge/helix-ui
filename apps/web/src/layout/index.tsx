import { useLocation } from "react-router-dom";
import AppLayout from "./app-layout";
import HomeLayout from "./home-layout";

export default function Layout() {
  const location = useLocation();
  return location.pathname === "/" ? <HomeLayout /> : <AppLayout />;
}
