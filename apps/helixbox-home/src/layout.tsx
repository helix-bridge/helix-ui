import { Outlet, useLocation } from "react-router-dom";
import HomepageHeader from "./components/homepage-header";
import HomepageFooter from "./components/homepage-footer";
import { useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <HomepageHeader />
      <Outlet />
      <HomepageFooter />
    </>
  );
}
