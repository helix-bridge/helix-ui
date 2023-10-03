// import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
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
import Image from "next/image";
import { useState } from "react";

interface Props {
  options: TokenSymbol[];
  // network?: Network;
  disabled?: boolean;
  value?: TokenSymbol;
  placeholder?: string;
  className?: string;
  onChange?: (value: TokenSymbol | undefined) => void;
}

export default function TokenSelect({
  options,
  disabled,
  value,
  placeholder,
  className,
  onChange = () => undefined,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
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
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <>
      <button
        className={`disabled:border-line gap-small border-line hover:border-primary flex items-center justify-between rounded border transition-colors duration-300 disabled:cursor-not-allowed ${className}`}
        ref={refs.setReference}
        {...getReferenceProps()}
        disabled={disabled}
      >
        <span className={`text-sm font-normal ${value ? "text-white" : "text-white/50"}`}>{value || placeholder}</span>

        <div className="gap-small flex shrink-0 items-center">
          {value ? (
            <button
              className="relative h-[16px] w-[16px] shrink-0 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/10 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <Image alt="Close" fill src="/images/close.svg" />
            </button>
          ) : null}
          <Image
            src="/images/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
            className="shrink-0"
            style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
          />
        </div>
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="bg-component border-line py-small flex flex-col rounded border">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="py-small px-large hover:text-primary text-start text-sm transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
