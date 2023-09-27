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
  value?: TokenSymbol;
  placeholder?: string;
  onChange?: (value: TokenSymbol) => void;
}

export default function TokenSelect({ options, value, placeholder, onChange }: Props) {
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
      <div
        className="gap-small border-line px-middle py-small flex items-center justify-between rounded border"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <span className={`text-sm font-normal ${value ? "text-white" : "text-white/50"}`}>{value || placeholder}</span>
        <Image
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </div>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="bg-component border-line py-small flex flex-col rounded border">
              {options.map((option) => (
                <button key={option}>{option}</button>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
