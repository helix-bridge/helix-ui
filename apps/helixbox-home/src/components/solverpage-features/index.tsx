import SolverpageFeature from "../solverpage-feature";
import f01 from "./1.png";
import f02 from "./2.png";
import f03 from "./3.png";

const features = [
  {
    content: "Market-making services for cross-chain bridges",
    img: f01,
    color: "#017FE4",
  },
  {
    content: "Solver services for platforms like CowSwap and UniswapX",
    img: f02,
    color: "#8B52E5",
  },
  {
    content: "AMM aggregation and multi-chain asset rebalancing",
    img: f03,
    color: "#FF130F",
  },
];

export default function SolverpageFeatures() {
  return (
    <div className="flex flex-col items-center gap-[90px] px-5 lg:my-[100px] lg:flex-row lg:items-stretch lg:justify-center lg:gap-[40px] lg:px-[60px]">
      {features.map((feature, index) => (
        <SolverpageFeature key={index} {...feature} dataAos="fade-up" dataAosDelay={index * 100} />
      ))}
    </div>
  );
}
