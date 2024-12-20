import { Link } from "react-router-dom";
import HomepageSocialMedia from "./homepage-social-media";
import { products } from "./homepage-products/data";

export default function HomepageFooter() {
  return (
    <>
      <div className="mt-[90px] flex flex-col items-center gap-5 p-5 lg:hidden" data-aos="fade-up">
        <HomepageSocialMedia className="gap-medium" />
        <About />
        <Copyright />
      </div>

      <div className="hidden justify-between p-[60px] lg:flex">
        <div
          className="flex flex-shrink-[1.4] flex-grow-[1.4] basis-0 flex-col justify-between"
          data-aos="fade-up-right"
        >
          <div className="flex flex-col gap-5">
            <img src="/images/logo.svg" alt="Helixbox logo" width={207.26} height={39} />
            <About />
          </div>
          <div className="flex flex-col gap-5">
            <HomepageSocialMedia className="gap-medium" />
            <Copyright />
          </div>
        </div>
        <Column
          title="Products"
          items={products.map((product) => ({
            label: product.title === "Liquidity Solver" ? "Helixbox Liquidity Solver" : product.title,
            link: product.link,
          }))}
          className="flex-1"
          dataAos="fade-up"
        />
        <Column
          title="Resources"
          items={[
            { label: "Docs", link: "https://docs.helix.box/" },
            { label: "Careers", link: "https://hirevise.com/itering" },
          ]}
          className="flex-shrink-[0.6] flex-grow-[0.6] basis-0"
          dataAos="fade-up-left"
        />
      </div>
    </>
  );
}

function About() {
  return (
    <span className="text-center text-base font-normal leading-[20.8px] text-white/50 lg:w-[80%] lg:text-start">
      Helixbox is focusing on becoming an efficient multi-chain liquidity provider, offering users a superior experience
      in multi-chain asset transfer and exchange.
    </span>
  );
}

function Copyright() {
  return (
    <span className="text-base font-normal leading-[20.8px] text-[#F6F6F7]">{`© ${new Date().getFullYear()} Powered by Helixbox Team`}</span>
  );
}

function Column({
  title,
  items,
  className,
  dataAos,
}: {
  title: string;
  items: { label: string; link: string }[];
  className?: string;
  dataAos?: string;
}) {
  return (
    <div className={`flex flex-col gap-[60px] ${className}`} data-aos={dataAos}>
      <h5 className="text-[30px] font-semibold leading-[39px] text-[#F6F6F7]">{title}</h5>
      {items.map((item) =>
        item.link.startsWith("http") ? (
          <a
            key={item.label}
            rel="noopener noreferrer"
            target="_blank"
            href={item.link}
            className="w-fit text-base font-normal leading-[20.8px] text-[#F6F6F7] underline-offset-4 hover:underline"
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.label}
            to={item.link}
            className="w-fit text-base font-normal leading-[20.8px] text-[#F6F6F7] underline-offset-4 hover:underline"
          >
            {item.label}
          </Link>
        ),
      )}
    </div>
  );
}
