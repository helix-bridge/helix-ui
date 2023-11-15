import { CSSProperties, PropsWithChildren } from "react";

interface Props {}

export default function ProgressIcon({}: Props) {
  return (
    <div className="border-primary h-5 w-5 rounded-full border-2 p-[2px]">
      <Ouro>
        {/* Left */}
        <span className="absolute left-0 h-full w-1/2 overflow-hidden">
          <Anim
            className="animate-progress-anim-left left-full rounded-l-none"
            style={{ transformOrigin: "0 50% 0" }}
          />
        </span>

        {/* Right */}
        <span className="absolute left-1/2 h-full w-1/2 overflow-hidden">
          <Anim
            className="animate-progress-anim-right -left-full rounded-r-none"
            style={{ transformOrigin: "100% 50% 0" }}
          />
        </span>
      </Ouro>
    </div>
  );
}

function Ouro({ children }: PropsWithChildren<unknown>) {
  return <div className={`relative h-full w-full rounded-full`}>{children}</div>;
}

function Anim({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span className={`bg-primary absolute top-0 h-full w-full rounded-full ${className}`} style={style}></span>;
}
