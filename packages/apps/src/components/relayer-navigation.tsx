import { useToggle } from "@/hooks/use-toggle";
import {
  FloatingPortal,
  offset,
  safePolygon,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";

const navigationsConfig: { label: string; href: string; icon: ReactElement }[] = [
  {
    href: "/relayer/overview",
    label: "Overview",
    icon: <Image width={18} height={18} alt="Overview" src="/images/overview.svg" className="shrink-0" />,
  },
  {
    href: "/relayer/my-relayers",
    label: "My relayer(s)",
    icon: <Image width={18} height={18} alt="My relayer(s)" src="/images/my.svg" className="shrink-0" />,
  },
];

interface Props {
  onClose?: () => void;
}

export default function RelayerNavigation({ onClose = () => undefined }: Props) {
  return (
    <>
      <Mobile onClose={onClose} />
      <PC />
    </>
  );
}

function PC() {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6)],
    placement: "bottom-start",
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });

  const hover = useHover(context, { handleClose: safePolygon() });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <div
        className="gap-middle hidden items-center rounded-lg px-3 py-1 transition hover:bg-white/10 lg:flex"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <span className="text-base font-medium">Relayer</span>
        <Triangle />
      </div>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="px-large gap-small bg-component py-large flex w-fit flex-col rounded-lg">
              {navigationsConfig.map(({ href, label, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-primary gap-middle flex items-center text-sm font-normal hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function Mobile({ onClose }: { onClose: () => void }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = useToggle(false);

  useEffect(() => {
    if (isOpen && nodeRef.current) {
      nodeRef.current.style.padding = "10px";
      nodeRef.current.style.height = `${nodeRef.current.scrollHeight + 20}px`;
    } else if (!isOpen && nodeRef.current) {
      nodeRef.current.style.height = `0`;
      nodeRef.current.style.padding = "0";
    }
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button className="gap-middle inline-flex items-center" onClick={toggle}>
        <span className="font-semibold">Relayer</span>
        <Triangle isOpen={isOpen} />
      </button>

      <div
        className="border-l-line gap-small flex flex-col overflow-hidden border-l transition-[height_padding]"
        ref={nodeRef}
      >
        {navigationsConfig.map(({ href, label, icon }) => (
          <Link
            key={label}
            href={href}
            className="gap-small text-primary inline-flex items-center text-sm font-medium hover:underline"
            onClick={onClose}
          >
            {icon}
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Triangle({ isOpen }: { isOpen?: boolean }) {
  return (
    <div
      className={`w-0 border-x-[5px] border-b-0 border-t-8 border-white border-x-transparent transition-transform duration-300`}
      style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
    />
  );
}
