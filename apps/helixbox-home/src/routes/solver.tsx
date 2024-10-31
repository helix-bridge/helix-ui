import SloganContainer from "../components/slogan-container";
import SolverpageFeatures from "../components/solverpage-features";

export default function Solver() {
  return (
    <main className="mt-[50px] lg:mt-[60px]">
      <SloganContainer className="mb-10 mt-[90px] py-[40px] lg:mb-20 lg:mt-[140px] lg:py-[60px]">
        <span className="text-sm font-normal leading-[18.2px] text-white lg:text-base lg:leading-[20px]">
          Helixbox Liquidity Solver
        </span>
        <h3 className="font-[KronaOne] text-[30px] font-normal leading-[37.5px] tracking-[2px] text-white lg:text-[64px] lg:leading-[80px]">
          High-Quality
        </h3>
        <span className="text-sm font-normal leading-[18.2px] tracking-[2px] text-white lg:text-[32px] lg:leading-[41.6px] lg:tracking-[3px]">
          Liquidity Sources Provider
        </span>
      </SloganContainer>
      <SolverpageFeatures />
    </main>
  );
}
