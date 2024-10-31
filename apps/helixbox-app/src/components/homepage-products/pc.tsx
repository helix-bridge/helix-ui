import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  Placement,
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  link: string;
  video: string;
  defaultVideo: string;
  placement: Placement;
  className?: string;
  onHovering?: (video: string) => void;
}

export default function PC({ title, description, link, video, defaultVideo, placement, className, onHovering }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false, handleClose: safePolygon() });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "scale(0.5)", opacity: 0 },
    open: { transform: "scale(1)", opacity: 1 },
    close: { transform: "scale(0.5)", opacity: 0 },
  });

  useEffect(() => {
    onHovering?.(isOpen ? video : defaultVideo);
  }, [video, defaultVideo, isOpen, onHovering]);

  return (
    <>
      {link.startsWith("http") ? (
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={link}
          ref={refs.setReference}
          {...getReferenceProps()}
          className={`group flex flex-col ${className}`}
        >
          {title.split(" ").map((t) => (
            <Span key={t} text={t} isOpen={isOpen} />
          ))}
        </a>
      ) : (
        <Link to={link} ref={refs.setReference} {...getReferenceProps()} className={`group flex flex-col ${className}`}>
          {title.split(" ").map((t) => (
            <Span key={t} text={t} isOpen={isOpen} />
          ))}
        </Link>
      )}

      {isMounted && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-30">
            <div
              style={styles}
              className="flex w-[380px] flex-col gap-5 rounded-[20px] bg-white/10 p-5 backdrop-blur-2xl"
            >
              <p className="text-[22px] font-normal leading-[28.6px] text-white/80">{description}</p>
              {link.startsWith("http") ? (
                <a
                  href={link}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-primary hover:bg-primary w-fit rounded-[10px] border border-white bg-white p-[10px] text-center text-sm font-bold leading-[18.2px] transition-colors hover:text-white"
                >
                  Explore Now
                </a>
              ) : (
                <Link
                  to={link}
                  className="text-primary hover:bg-primary w-fit rounded-[10px] border border-white bg-white p-[10px] text-center text-sm font-bold leading-[18.2px] transition-colors hover:text-white"
                >
                  Explore Now
                </Link>
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function Span({ text, isOpen }: { text: string; isOpen: boolean }) {
  return (
    <span
      key={text}
      className="font-[KronaOne] text-[60px] font-normal leading-[75px] text-white/50 transition-colors group-hover:text-white"
      style={isOpen ? { color: "white" } : undefined}
    >
      {text}
    </span>
  );
}
