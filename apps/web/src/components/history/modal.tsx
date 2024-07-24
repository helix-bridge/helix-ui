import { PropsWithChildren, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";

interface Props {
  isDetail?: boolean;
  isOpen?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

export default function Modal({ children, isDetail, isOpen, onBack, onClose }: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      document.body.style.overflow = "auto";
    },
    [],
  );

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      nodeRef={nodeRef}
      classNames="modal-fade"
      unmountOnExit
      onEnter={() => {
        document.body.style.overflow = "hidden";
      }}
      onExited={() => {
        document.body.style.overflow = "auto";
      }}
    >
      {/* Mask */}
      <div
        className="bg-background/80 p-medium fixed left-0 top-0 z-[21] flex h-screen w-screen items-center justify-center overflow-auto backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
        ref={nodeRef}
      >
        {/* Modal */}
        <div className="bg-secondary p-medium relative h-[36rem] w-full rounded-3xl lg:w-[42rem] lg:p-5">
          {/* Close */}
          <button
            className="right-medium top-medium absolute rounded-full bg-transparent p-[4px] transition hover:scale-105 hover:bg-white/10 active:scale-95"
            onClick={onClose}
          >
            <img width={20} height={20} alt="Close modal" src="images/close-white.svg" />
          </button>

          {/* Title */}
          <div className="flex h-6 items-center pl-1 lg:pl-0">
            {isDetail ? (
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                className="text-white/60 transition-[transform,color] hover:scale-105 hover:cursor-pointer hover:text-white active:scale-95"
                onClick={onBack}
              >
                <path
                  d="M402.746 146.746l-320 320c-24.994 24.992-24.994 65.516 0 90.508l320 320c24.994 24.992 65.516 24.992 90.51 0 24.996-24.992 24.996-65.516 0-90.508L282.508 576 896 576c35.346 0 64-28.652 64-64 0-35.346-28.654-64-64-64L282.508 448l210.746-210.746C505.75 224.758 512 208.378 512 192s-6.248-32.758-18.744-45.254C468.26 121.752 427.74 121.752 402.746 146.746z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <h3 className="font-bold text-white">History</h3>
            )}
          </div>

          {/* Body */}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
