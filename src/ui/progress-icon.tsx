import { Subscription, interval } from "rxjs";
import { CSSProperties, PropsWithChildren, forwardRef, useEffect, useRef } from "react";

interface Props {
  percent?: number; // Value between 0 and 100
}

export default function ProgressIcon({ percent = 100 }: Props) {
  const leftRef = useRef<HTMLSpanElement | null>(null);
  const rightRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    const leftAnimation = leftRef.current?.getAnimations().at(0);
    const rightAnimation = rightRef.current?.getAnimations().at(0);

    if (leftAnimation && rightAnimation) {
      sub$$ = interval(300).subscribe(() => {
        const leftProgress = (leftAnimation?.effect?.getComputedTiming().progress || 0) * 100 + 50;
        const rightProgress = (rightAnimation?.effect?.getComputedTiming().progress || 0) * 100;

        if (percent <= 50 && percent <= rightProgress) {
          leftAnimation.pause();
          rightAnimation.pause();
        } else if (50 < percent && percent <= leftProgress) {
          leftAnimation.pause();
          rightAnimation.pause();
        } else {
          leftAnimation.play();
          rightAnimation.play();
        }
      });
    }

    return () => sub$$?.unsubscribe();
  }, [percent]);

  return (
    <div className="h-[22px] w-[22px] rounded-full border-2 border-primary p-[2px]">
      <Ouro>
        <span className="absolute left-0 h-full w-1/2 overflow-hidden">
          <Anim
            className="left-full animate-progress-anim-left rounded-l-none"
            style={{ transformOrigin: "0 50% 0" }}
            ref={leftRef}
          />
        </span>
        <span className="absolute left-1/2 h-full w-1/2 overflow-hidden">
          <Anim
            className="-left-full animate-progress-anim-right rounded-r-none"
            style={{ transformOrigin: "100% 50% 0" }}
            ref={rightRef}
          />
        </span>
      </Ouro>
    </div>
  );
}

function Ouro({ children }: PropsWithChildren<unknown>) {
  return <div className={`relative h-full w-full`}>{children}</div>;
}

const Anim = forwardRef<HTMLSpanElement, { className?: string; style?: CSSProperties }>(function Anim(
  { className, style },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`absolute top-0 h-full w-full rounded-full bg-primary ${className}`}
      style={style}
    ></span>
  );
});
