import Image from "next/image";
import { PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";

interface Props {
  isOpen: boolean;
  title: string;
  cancelText?: string;
  okText?: string;
  maskClosable?: boolean;
  className?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}

export default function Modal({
  title,
  isOpen,
  maskClosable,
  children,
  cancelText,
  okText,
  className,
  onClose = () => undefined,
  onCancel,
  onOk,
}: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

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
      {/* mask */}
      <div
        ref={nodeRef}
        onClick={() => maskClosable && onClose()}
        className="p-middle bg-app-bg/80 fixed left-0 top-0 z-20 flex items-center justify-center"
      >
        {/* modal */}
        <div
          className={`p-middle relative flex flex-col gap-5 lg:p-7 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* close icon */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/80 active:scale-95"
          >
            <Image width={24} height={24} alt="Close" src="/images/close-white.svg" />
          </button>

          {/* header */}
          <h5 className="text-xl font-semibold text-white">{title}</h5>

          <div className="bg-line h-[1px]" />

          {/* body */}
          {children}

          {/* footer */}
          {(onCancel || onOk) && (
            <>
              <div className="bg-line h-[1px]" />

              <div className="gap-large flex items-center justify-between">
                {onCancel && (
                  <button className="border-primary h-9 rounded border bg-transparent">{cancelText || "Cancel"}</button>
                )}
                {onOk && <button className="border-primary bg-primary h-9 rounded border">{okText || "Ok"}</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
