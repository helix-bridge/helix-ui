import { PropsWithChildren, ReactElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import Button from "./button";

interface Props {
  isOpen: boolean;
  title: string;
  subTitle?: ReactElement | string | null;
  cancelText?: string;
  okText?: string;
  maskClosable?: boolean;
  className?: string;
  disabledCancel?: boolean;
  disabledOk?: boolean;
  busy?: boolean;
  extra?: ReactElement | null;
  forceFooterHidden?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}

/**
 * Please note: Disable SSR when importing
 */
export default function Modal({
  title,
  subTitle,
  isOpen,
  maskClosable,
  children,
  cancelText,
  okText,
  className,
  disabledCancel,
  disabledOk,
  busy,
  extra,
  forceFooterHidden,
  onClose = () => undefined,
  onCancel,
  onOk,
}: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

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
      appear
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
        className="bg-app-bg/80 p-medium fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm"
      >
        {/* modal */}
        <div
          className={`p-medium relative flex flex-col gap-5 rounded-3xl bg-[#1F282C] lg:p-5 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* close icon */}
          <button
            onClick={onClose}
            className="right-medium top-medium absolute rounded-full bg-transparent p-[4px] transition hover:scale-105 hover:bg-white/10 active:scale-95"
          >
            <img width={20} height={20} alt="Close" src="images/close-white.svg" />
          </button>

          {/* header */}
          <div className="gap-medium flex flex-col lg:gap-5">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {subTitle ? (
              typeof subTitle === "string" ? (
                <h5 className="text-base font-normal text-white">{subTitle}</h5>
              ) : (
                subTitle
              )
            ) : null}
          </div>

          <div className="h-[1px] bg-white/10" />

          {/* body */}
          {children}

          {/* footer */}
          {forceFooterHidden ? null : onCancel || onOk ? (
            <>
              <div className="gap-small flex flex-col">
                {extra}
                <div className="h-[1px] bg-white/10" />
              </div>

              <div className="flex items-center justify-between gap-5">
                {onCancel && (
                  <Button
                    kind="default"
                    onClick={onCancel}
                    disabled={disabledCancel}
                    className="h-10 flex-1 rounded-[1.25rem] text-sm font-bold"
                  >
                    {cancelText || "Cancel"}
                  </Button>
                )}
                {onOk && (
                  <Button
                    kind="primary"
                    onClick={onOk}
                    disabled={disabledOk}
                    busy={busy}
                    className="h-10 flex-1 rounded-[1.25rem] text-sm font-bold"
                  >
                    {okText || "Ok"}
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
