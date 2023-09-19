import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { PropsWithChildren, ReactElement, useRef, useState } from "react";

interface Props {
  content: ReactElement | string;
  enabledSafePolygon?: boolean;
  enabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function Tooltip({
  children,
  content,
  enabledSafePolygon,
  className,
  contentClassName,
  enabled = true,
}: PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false, handleClose: enabledSafePolygon ? safePolygon() : undefined });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "scale(0.5)", opacity: 0 },
    open: { transform: "scale(1)", opacity: 1 },
    close: { transform: "scale(0.5)", opacity: 0 },
  });

  return enabled ? (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className={`${className}`}>
        {children}
      </div>
      {isMounted && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-30">
            <FloatingArrow ref={arrowRef} style={styles} context={context} fill="#343946" />
            <div
              style={styles}
              className={`border-line bg-component px-middle py-small flex items-center rounded border ${contentClassName}`}
            >
              {content}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  ) : (
    children
  );
}