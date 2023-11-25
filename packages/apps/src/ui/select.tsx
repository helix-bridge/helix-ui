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
import Button from "./button";

interface Props {
  label?: ReactElement;
  placeholder: ReactElement;
  disabled?: boolean;
  hoverable?: boolean;
  clearable?: boolean;
  sameWidth?: boolean;
  placement?: Placement;
  labelClassName?: string;
  childClassName?: string;
  onClear?: () => void;
}

export default function Select({
  label,
  placeholder,
  disabled,
  children,
  hoverable,
  clearable,
  placement,
  sameWidth,
  labelClassName,
  childClassName,
  onClear = () => undefined,
}: PropsWithChildren<Props>) {
  const { state: isOpen, setState: setIsOpen, setFalse: setIsOpenFalse } = useToggle(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
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
      <Button className={`${labelClassName}`} ref={refs.setReference} {...getReferenceProps()} disabled={disabled}>
        {label || placeholder}
        <div className="gap-small flex shrink-0 items-center">
          {label && clearable ? (
            <div
              className="relative h-[16px] w-[16px] shrink-0 rounded-full bg-transparent p-[2px] opacity-80 transition hover:scale-105 hover:bg-white/20 hover:opacity-100 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <Image alt="Close" fill src="/images/close.svg" />
            </div>
          ) : null}
          <Image
            style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
            className="shrink-0 transition-transform"
            src="/images/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
          />
        </div>
      </Button>

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