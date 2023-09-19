import CountLoading from "@/ui/count-loading";
import { useRef } from "react";

interface Props {
  loading: boolean;
  className?: string;
}

export default function ComponentLoading({ loading, className }: Props) {
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // return (
  //   <CSSTransition in={loading} timeout={300} nodeRef={loadingRef} classNames="component-loading" unmountOnExit appear>
  //     <div
  //       className={`absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center ${className}`}
  //       ref={loadingRef}
  //     >
  //       <CountLoading size="large" />
  //     </div>
  //   </CSSTransition>
  // );
  return (
    loading && (
      <div
        className={`absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-black/30 ${className}`}
        ref={loadingRef}
      >
        <CountLoading size="large" />
      </div>
    )
  );
}
