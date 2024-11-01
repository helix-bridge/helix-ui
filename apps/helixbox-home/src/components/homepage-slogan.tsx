export default function HomepageSlogan() {
  return (
    <div className="flex w-full flex-col items-center font-[KronaOne] uppercase">
      <div className="relative h-[1lh] w-full overflow-hidden text-[32px] font-normal leading-[52.5px] tracking-[2px] text-white transition-[top] lg:text-[130px] lg:leading-[162.5px] lg:tracking-[3px]">
        <AnimText>Liquidity</AnimText>
        <AnimText style={{ animationDelay: "-3500ms" }}>Cross-Chain</AnimText>
      </div>
      <span className="text-[26px] font-normal leading-[32.5px] text-white/50 lg:text-[78px] lg:leading-[97.5px]">
        Without Limits
      </span>
    </div>
  );
}

function AnimText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="animate-scroll-to-bottom absolute left-0 inline-flex w-full justify-center" style={style}>
      {children}
    </div>
  );
}
