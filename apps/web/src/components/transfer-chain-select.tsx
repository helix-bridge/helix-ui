import {
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { PropsWithChildren, useState } from "react";

interface Props {
  label: JSX.Element;
}

export default function TransferChainSelect({ children, label }: PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom",
    middleware: [
      offset(6),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
        },
      }),
    ],
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <>
      <button
        className={`gap-small mx-medium py-small group flex w-full items-center justify-between rounded-[0.625rem] transition-colors hover:bg-white/5 ${isOpen ? "bg-white/5" : ""}`}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div
          className={`gap-medium flex items-center transition-transform group-hover:translate-x-2 ${isOpen ? "translate-x-2" : ""}`}
        >
          {label}
        </div>
        <div className={`transition-transform group-hover:-translate-x-2 ${isOpen ? "-translate-x-2" : ""}`}>
          <img
            style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
            className="shrink-0 transition-transform"
            src="images/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
          />
        </div>
      </button>
      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              className="py-medium rounded-large flex flex-col gap-2 border border-white/20 bg-[#00141D]"
              onClick={() => setIsOpen(false)}
              style={styles}
            >
              {children}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
