"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
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
        className="fixed left-0 top-0 z-20 h-screen w-screen bg-app-bg/80"
      >
        <div
          className="absolute right-0 top-0 h-screen w-3/4 overflow-y-auto bg-component"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full w-full flex-col items-start">
            <div className="flex w-full items-center justify-between p-middle">
              <Link href="/" onClick={onClose}>
                <Image width={152} height={18} alt="Logo" src="/images/projects/darwinia.png" />
              </Link>
              <Image
                width={24}
                height={24}
                alt="Close"
                src="/images/close.svg"
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
