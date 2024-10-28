import { Link } from "react-router-dom";
import HomepageHeaderNav from "./homepage-header-nav";
import HomepageMobileMenu from "./homepage-mobile-menu";

const navigations: (
  | { label: string; link: string; items?: never }
  | { label: string; link?: never; items: { label: string; link: string }[] }
)[] = [
  {
    label: "Products",
    items: [
      { label: "Helixbox Bridge", link: "/transfer" },
      { label: "XToken BaaS", link: "https://xtoken.box/" },
      { label: "Helixbox Liquidity Solver", link: "/liquidity-solver" },
    ],
  },
  { label: "Docs", link: "https://docs.helixbridge.app/" },
  { label: "Careers", link: "https://apply.workable.com/itering/" },
];

export default function HomepageHeader() {
  return (
    <div className="fixed left-0 top-0 z-40 flex h-[50px] w-full items-center justify-between px-[20px] backdrop-blur-lg lg:h-[64px] lg:px-[60px]">
      <Link to="/">
        <img
          alt="Helixbox logo"
          src="images/helixbox-logo.svg"
          className="h-[20px] w-[106.64px] lg:h-[26px] lg:w-[138.84px]"
        />
      </Link>

      <HomepageMobileMenu data={navigations} />

      <div className="hidden items-center gap-[50px] lg:flex">
        {navigations.map((item) => (
          <HomepageHeaderNav key={item.label} {...item} pcStyle />
        ))}
        <Link
          to="/transfer"
          className="p-medium text-primary rounded-[10px] bg-white text-sm font-bold leading-[18.2px]"
        >
          Helixbox Bridge
        </Link>
      </div>
    </div>
  );
}
