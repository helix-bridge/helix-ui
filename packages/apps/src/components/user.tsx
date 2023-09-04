import { toShortAdrress } from "@/utils";
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
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

interface Props {
  className?: string;
  onClose?: () => void;
}

export default function User({ className, onClose = () => undefined }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
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

  return address ? (
    <>
      <Button className={className} ref={refs.setReference} {...getReferenceProps()}>
        {toShortAdrress(address)}
        <Image
          src="/images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </Button>
      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              style={styles}
              className="bg-component flex flex-col rounded border border-white/20 lg:border-white/10"
            >
              <Link
                href="/records"
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
                className="px-large py-small text-start transition hover:bg-white/10 active:translate-y-1"
              >
                <span className="text-sm font-light">History</span>
              </Link>
              <button
                onClick={() => disconnect()}
                className="px-large py-small text-start transition hover:bg-white/10 active:translate-y-1"
              >
                <span className="text-sm font-light">Disconnect</span>
              </button>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  ) : (
    <Button className={className} onClick={openConnectModal}>
      Connect Wallet
    </Button>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { children, className, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={`bg-primary shrink-0 rounded transition active:translate-y-1 ${className}`} {...rest}>
      {children}
    </button>
  );
});
