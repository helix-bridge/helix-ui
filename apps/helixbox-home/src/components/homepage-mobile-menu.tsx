import { PropsWithChildren, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import HomepageHeaderNav from "./homepage-header-nav";
import { Link } from "react-router-dom";
import HomepageSocialMedia from "./homepage-social-media";

interface Props {
  data: (
    | { label: string; link: string; items?: never }
    | { label: string; link?: never; items: { label: string; link: string }[] }
  )[];
}

export default function HomepageMobileMenu({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="flex h-[34px] w-[34px] items-center justify-center lg:hidden" onClick={() => setIsOpen(true)}>
        <img alt="Menu icon" width={20} height={20} src="images/mobile-header-menu.svg" />
      </button>
      <Drawer isOpen={isOpen} onClose={setIsOpen}>
        <div className="flex w-64 flex-col gap-20">
          <Link
            to="/"
            className="w-fit text-xl font-bold text-white"
            onClick={() => setIsOpen(false)}
            data-aos="fade-right"
          >
            Home
          </Link>
          {data.map((item, index) => (
            <HomepageHeaderNav
              key={item.label}
              dataAos="fade-right"
              dataAosDelay={index * 100 + 100}
              {...item}
              onClick={() => setIsOpen(false)}
            />
          ))}
          <HomepageSocialMedia
            className="gap-10 self-start"
            dataAos="fade-right"
            dataAosDelay={data.length * 100 + 100}
          />
        </div>
      </Drawer>
    </>
  );
}

function Drawer({
  children,
  isOpen,
  onClose,
}: PropsWithChildren<{ isOpen: boolean; onClose?: (isOpen: boolean) => void }>) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      nodeRef={nodeRef}
      classNames="drawer-fade"
      unmountOnExit
      onEnter={() => {
        document.body.style.overflow = "hidden";
      }}
      onExited={() => {
        document.body.style.overflow = "auto";
      }}
    >
      <div
        ref={nodeRef}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fixed left-0 top-0 z-50 h-screen w-screen overflow-y-auto bg-black/20 backdrop-blur-md"
      >
        <div className="p-medium flex justify-end">
          <img
            width={34}
            height={34}
            alt="Close"
            src="images/close.svg"
            className="transition-transform active:scale-95"
            onClick={() => onClose?.(false)}
          />
        </div>
        <div className="mt-12 flex flex-col items-center">{children}</div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
