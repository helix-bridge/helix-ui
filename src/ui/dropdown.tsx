import { useToggle } from "@/hooks/use-toggle";
import {
  FloatingPortal,
  Placement,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import { PropsWithChildren, ReactElement } from "react";

interface Props {
  label: ReactElement;
  placement?: Placement;
  hoverable?: boolean;
  sameWidth?: boolean;
  labelClassName?: string;
  childClassName?: string;
}

export default function Dropdown({
  label,
  children,
  placement,
  hoverable,
  sameWidth,
  labelClassName,
  childClassName,
}: PropsWithChildren<Props>) {
  const { state: isOpen, setState: setIsOpen, setFalse: setIsOpenFalse } = useToggle(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(6),
      sameWidth
        ? size({
            apply({ rects, elements }) {
              Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
            },
          })
        : undefined,
    ],
    placement,
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });

  const hover = useHover(context, { enabled: !!hoverable });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  return (
    <>
      <button className={`${labelClassName}`} ref={refs.setReference} {...getReferenceProps()}>
        {label}
        <Image
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
          className="shrink-0 transition-transform"
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
        />
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div className={`${childClassName}`} style={styles} onClick={setIsOpenFalse}>
              {children}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
