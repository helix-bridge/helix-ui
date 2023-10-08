import { Network } from "@/types/chain";
import { getChainConfig } from "@/utils/chain";
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
  options: Network[];
  value?: Network;
  placeholder?: string;
  className?: string;
  onChange?: (value: Network | undefined) => void;
}

export default function ChainSelect({ options, value, placeholder, className, onChange = () => undefined }: Props) {
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

  const chainConfig = getChainConfig(value);

  return (
    <>
      <button
        className={`gap-small flex items-center justify-between rounded border transition-colors duration-300 ${className}`}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <span className={`truncate text-sm font-normal ${value ? "text-white" : "text-white/50"}`}>
          {chainConfig?.name || placeholder}
        </span>

        <div className="gap-small flex shrink-0 items-center">
          {value ? (
            <div
              className="relative h-[16px] w-[16px] shrink-0 rounded-full bg-transparent p-[2px] opacity-80 transition hover:scale-105 hover:bg-white/20 hover:opacity-100 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <Image alt="Close" fill src="/images/close.svg" />
            </div>
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
              {options.map((option) => {
                const config = getChainConfig(option);

                return (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className="py-small px-large hover:text-primary text-start text-sm transition-colors"
                  >
                    {config?.name || option}
                  </button>
                );
              })}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
