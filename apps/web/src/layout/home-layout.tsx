import { Outlet } from "react-router-dom";
import HomepageHeader from "../components/homepage-header";
import HomepageFooter from "../components/homepage-footer";

export default function HomeLayout() {
  return (
    <>
      <HomepageHeader />
      <Outlet />
      <HomepageFooter />
    </>
  );
}
