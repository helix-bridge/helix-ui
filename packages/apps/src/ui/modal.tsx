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
  disabledCancel?: boolean;
  disabledOk?: boolean;
  busy?: boolean;
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
  disabledCancel,
  disabledOk,
  busy,
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
        className="p-middle bg-app-bg/80 fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center"
      >
        {/* modal */}
        <div
          className={`p-middle bg-component relative flex flex-col gap-5 rounded-md lg:p-7 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* close icon */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/10 active:scale-95"
          >
            <Image width={20} height={20} alt="Close" src="/images/close-white.svg" />
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

              <div className="flex items-center justify-between gap-5">
                {onCancel && (
                  <Button type="default" onClick={onCancel} disabled={disabledCancel}>
                    {cancelText || "Cancel"}
                  </Button>
                )}
                {onOk && (
                  <Button type="primary" onClick={onOk} disabled={disabledOk} busy={busy}>
                    {okText || "Ok"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}

function Button({
  children,
  type,
  busy,
  disabled,
  onClick,
}: PropsWithChildren<{ type: "primary" | "default"; busy?: boolean; disabled?: boolean; onClick?: () => void }>) {
  return (
    <button
      className={`border-primary relative h-9 flex-1 rounded border transition disabled:cursor-not-allowed ${
        type === "primary" ? "bg-primary" : "bg-transparent"
      } ${busy ? "" : "hover:opacity-80 active:translate-y-1 disabled:opacity-60"}`}
      disabled={disabled || busy}
      onClick={onClick}
    >
      {busy && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-b-white/50 border-l-white/50 border-r-white border-t-white" />
        </div>
      )}
      <span className="text-sm font-medium text-white">{children}</span>
    </button>
  );
}
