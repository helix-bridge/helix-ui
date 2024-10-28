import HomepageSlogan from "../components/homepage-slogan";
import HomepageOneStopEntry from "../components/homepage-one-stop-entry";
import HomepageProducts from "../components/homepage-products";
import HomepageProjects from "../components/homepage-projects";

export default function Home() {
  return (
    <main className="mt-[50px] lg:mt-[60px]">
      <div className="relative mb-10 mt-[90px] py-[50px] lg:mb-48 lg:mt-[140px] lg:py-[100px]">
        <div className="absolute left-0 top-0 h-full w-full rounded-[50%] bg-[#008CFF]/30 blur-[100px]" />
        <HomepageSlogan />
        <HomepageOneStopEntry className="flex lg:hidden" />
      </div>
      <div className="flex flex-col gap-[116px]">
        <HomepageProducts />
        <HomepageOneStopEntry className="hidden lg:flex" />
      </div>
      <HomepageProjects />
    </main>
  );
}
