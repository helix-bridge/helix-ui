import { useCallback, useEffect, useRef, useState } from "react";
import { interval } from "rxjs";

// In order to make the img tag adaptive to size, we use this import method.
import p01 from "./01.png";
import p02 from "./02.png";
import p03 from "./03.png";
import p04 from "./04.png";
import p05 from "./05.png";
import p06 from "./06.png";
import p07 from "./07.png";
import p08 from "./08.png";
import p09 from "./09.png";
import p10 from "./10.png";
import p11 from "./11.png";
import p12 from "./12.png";
import p13 from "./13.png";
import p14 from "./14.png";
import p15 from "./15.png";
import p16 from "./16.png";
import p17 from "./17.png";
import p18 from "./18.png";
import p19 from "./19.png";
import p20 from "./20.png";
import { useMediaQuery } from "../../hooks/use-media-query";

interface Project {
  img: string;
  name: string;
}

const pData1: Project[] = [
  { img: p01, name: "Project 1" },
  { img: p02, name: "Project 2" },
  { img: p03, name: "Project 3" },
  { img: p04, name: "Project 4" },
  { img: p05, name: "Project 5" },
  { img: p06, name: "Project 6" },
  { img: p07, name: "Project 7" },
  { img: p08, name: "Project 8" },
  { img: p09, name: "Project 9" },
  { img: p10, name: "Project 10" },
];

const pData2: Project[] = [
  { img: p11, name: "Project 11" },
  { img: p12, name: "Project 12" },
  { img: p13, name: "Project 13" },
  { img: p14, name: "Project 14" },
  { img: p15, name: "Project 15" },
  { img: p16, name: "Project 16" },
  { img: p17, name: "Project 17" },
  { img: p18, name: "Project 18" },
  { img: p19, name: "Project 19" },
  { img: p20, name: "Project 20" },
];

export default function HomepageProjects() {
  return (
    <div className="mt-[90px] flex w-full flex-col gap-5 lg:gap-10 lg:py-[100px]" data-aos="fade-up">
      <AutoInfiniteScroll items={pData1} />
      <AutoInfiniteScroll initOffset={96} items={pData2} />
    </div>
  );
}

const Card = ({
  project,
  halfSize = false,
  onLoad,
}: {
  project: Project;
  halfSize?: boolean;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}) => {
  const isLoaded = useRef(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (isLoaded.current && ref.current) {
      if (halfSize) {
        ref.current.width = ref.current.naturalWidth / 4;
        ref.current.height = ref.current.naturalHeight / 4;
      } else {
        ref.current.width = ref.current.naturalWidth / 2;
        ref.current.height = ref.current.naturalHeight / 2;
      }
    }
  }, [halfSize]);
  return (
    <img
      ref={ref}
      alt={project.name}
      src={project.img}
      onLoad={(e) => {
        onLoad?.(e);
        isLoaded.current = true;
        if (ref.current) {
          if (halfSize) {
            ref.current.width = ref.current.naturalWidth / 4;
            ref.current.height = ref.current.naturalHeight / 4;
          } else {
            ref.current.width = ref.current.naturalWidth / 2;
            ref.current.height = ref.current.naturalHeight / 2;
          }
        }
      }}
    />
  );
};

function AutoInfiniteScroll({ items, initOffset = 0 }: { initOffset?: number; items: Project[] }) {
  const isOnPc = useMediaQuery("lg");
  const initedOffset = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [itemsWidth, setItemsWidth] = useState(new Array(items.length).fill(0));

  const isRailsLoaded = useRef(false);
  const railsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const container = e.currentTarget;
      const scrollPos = container.scrollLeft;
      const allItemsWidth = itemsWidth.reduce((acc, cur) => acc + cur, 0);

      if (scrollPos >= allItemsWidth) {
        container.scrollLeft = 1;
      } else if (scrollPos <= 0) {
        container.scrollLeft = allItemsWidth + 1;
      }
    },
    [itemsWidth],
  );

  useEffect(() => {
    const sub$$ = interval(30).subscribe(() => {
      if (containerRef.current) {
        if (!initedOffset.current && containerRef.current.scrollLeft) {
          initedOffset.current = true;
          containerRef.current.scrollBy({ left: initOffset });
        } else if (!isHovering) {
          containerRef.current.scrollBy(1, 0);
        }
      }
    });
    return () => {
      sub$$.unsubscribe();
    };
  }, [isHovering, initOffset]);

  useEffect(() => {
    if (containerRef.current && railsRef.current) {
      containerRef.current.style.height = `${railsRef.current.clientHeight}px`;
    }
  }, [isOnPc]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-hidden relative w-full overflow-x-scroll"
      onScroll={handleScroll}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="absolute flex items-center gap-[35px] lg:gap-[70px]"
        onLoad={() => {
          if (containerRef.current && railsRef.current) {
            containerRef.current.style.height = `${railsRef.current.clientHeight}px`;
          }
          isRailsLoaded.current = true;
        }}
        ref={railsRef}
      >
        {items.map((item, index) => (
          <Card
            key={index}
            halfSize={!isOnPc}
            project={item}
            onLoad={(e) => {
              if (e.currentTarget) {
                const width = e.currentTarget.offsetWidth;
                setItemsWidth((prev) => {
                  prev[index] = width;
                  return [...prev];
                });
              }
            }}
          />
        ))}

        {/* Clone */}
        {items
          .concat(items)
          .concat(items)
          .map((item, index) => (
            <Card key={index} halfSize={!isOnPc} project={item} />
          ))}
      </div>
    </div>
  );
}
