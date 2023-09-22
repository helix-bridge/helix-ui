import { BridgeCategory } from "@/types/bridge";
import { bridgeFactory } from "@/utils/bridge";
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
  options: BridgeCategory[];
  value?: BridgeCategory | null;
  onChange?: (value: BridgeCategory) => void;
}

export default function BridgeSelect({ options, value, onChange = () => undefined }: Props) {
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

  const active = value ? bridgeFactory({ category: value }) : null;

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="bg-app-bg hover:border-line p-middle flex items-center justify-between rounded border border-transparent transition-colors"
      >
        <span className="text-sm font-normal text-white">{active?.getName() || "Select a bridge"}</span>
        <Image
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </button>
      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="bg-component border-line py-small flex flex-col rounded border">
              {options.map((c) => {
                const b = bridgeFactory({ category: c });
                return (
                  <button
                    key={c}
                    onClick={() => {
                      onChange(c);
                      setIsOpen(false);
                    }}
                    className="hover:text-primary px-middle py-small text-start text-sm font-light text-white transition-colors"
                  >
                    {b?.getName() || "Unknown"}
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
