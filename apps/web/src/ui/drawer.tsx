import { PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

interface Props {
  isOpen: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
}

/**
 * Please note: Disable SSR when importing
 */
export default function Drawer({
  children,
  isOpen,
  maskClosable,
  onClose = () => undefined,
}: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

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
        onClick={() => maskClosable && onClose()}
        className="bg-app-bg/80 fixed left-0 top-0 z-20 h-screen w-screen backdrop-blur-sm"
      >
        <div
          className="bg-secondary absolute right-0 top-0 h-screen w-3/4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full w-full flex-col items-start">
            <div className="p-medium flex w-full items-center justify-between">
              <Link to="/" onClick={onClose}>
                <img width={90} height={25} alt="Logo" src="images/logo.svg" />
              </Link>
              <img
                width={24}
                height={24}
                alt="Close"
                src="images/close.svg"
                className="transition-transform active:scale-95"
                onClick={onClose}
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
