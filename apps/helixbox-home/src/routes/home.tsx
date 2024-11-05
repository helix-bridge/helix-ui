import HomepageSlogan from "../components/homepage-slogan";
import HomepageOneStopEntry from "../components/homepage-one-stop-entry";
import HomepageProducts from "../components/homepage-products";
import HomepageProjects from "../components/homepage-projects";
import SloganContainer from "../components/slogan-container";

export default function Home() {
  return (
    <main className="mt-[50px] lg:mt-[60px]">
      <SloganContainer className="z-10 mb-10 mt-[90px] py-[50px] lg:mb-48 lg:mt-[140px] lg:py-[60px]">
        <HomepageSlogan />
        <HomepageOneStopEntry className="flex lg:hidden" />
      </SloganContainer>
      <div className="flex flex-col gap-[116px]">
        <HomepageProducts />
        <HomepageOneStopEntry className="hidden lg:flex" />
      </div>
      <HomepageProjects />
    </main>
  );
}
