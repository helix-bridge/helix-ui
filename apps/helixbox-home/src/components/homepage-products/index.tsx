import { useMemo, useRef, useState } from "react";
import Mobile from "./mobile";
import PC from "./pc";
import { products } from "./data";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const defaultVideo = "videos/logo.mp4";

export default function HomepageProducts() {
  const [video, setVideo] = useState(defaultVideo);

  return (
    <>
      <div className="flex flex-col gap-[90px] lg:hidden">
        {products.map((product) => (
          <Mobile key={product.title} {...product} />
        ))}
      </div>
      <div className="relative hidden scale-90 items-center justify-center lg:flex 2xl:scale-100">
        <AnimatedVideo video={video} />

        <div className="absolute -top-[94px] left-[50%] -translate-x-[50%]">
          <PC
            {...products[0]}
            placement="right-end"
            className="items-center"
            defaultVideo={defaultVideo}
            onHovering={setVideo}
          />
        </div>
        <div className="absolute bottom-[54px] left-[50%] -translate-x-[520px]">
          <PC
            {...products[1]}
            placement="top-end"
            className="items-end"
            defaultVideo={defaultVideo}
            onHovering={setVideo}
          />
        </div>
        <div className="absolute bottom-[54px] left-[50%] translate-x-[240px]">
          <PC
            {...products[2]}
            placement="top-start"
            className="items-start"
            defaultVideo={defaultVideo}
            onHovering={setVideo}
          />
        </div>
      </div>
    </>
  );
}

function AnimatedVideo({ video }: { video: string }) {
  const previousRef = useRef<HTMLVideoElement>(null);
  const currentRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(video);

  const nodeRef = useMemo(() => {
    const next = activeRef.current === video ? currentRef : previousRef;
    activeRef.current = video;
    return next;
  }, [video]);

  return (
    <SwitchTransition>
      <CSSTransition timeout={200} key={video} nodeRef={nodeRef} classNames="video-fade" unmountOnExit>
        <video
          ref={nodeRef}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          width={720}
          height={720}
          className="h-[720px] w-[720px]"
        />
      </CSSTransition>
    </SwitchTransition>
  );
}
