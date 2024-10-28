import {
  FloatingPortal,
  offset,
  safePolygon,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

type Props =
  | {
      label: string;
      items: { label: string; link: string }[];
      link?: never;
      pcStyle?: boolean;
      onClick?: () => void;
    }
  | {
      label: string;
      link: string;
      items?: never;
      pcStyle?: boolean;
      onClick?: () => void;
    };

export default function HomepageHeaderNav({ label, items, link, pcStyle, onClick }: Props) {
  return link !== undefined ? (
    link.startsWith("http") ? (
      <a
        rel="noopener noreferrer"
        target="_blank"
        href={link}
        className="w-fit text-xl font-bold text-white lg:text-lg lg:font-normal lg:leading-[23.4px] lg:tracking-[1px]"
      >
        {label}
      </a>
    ) : (
      <Link
        to={link}
        className="w-fit text-xl font-bold text-white lg:text-lg lg:font-normal lg:leading-[23.4px] lg:tracking-[1px]"
        onClick={onClick}
      >
        {label}
      </Link>
    )
  ) : pcStyle ? (
    <PcDropdown label={label} items={items} />
  ) : (
    <MobileDropdown label={label} items={items} onClick={onClick} />
  );
}

function MobileDropdown({
  label,
  items,
  onClick,
}: {
  label: string;
  items: { label: string; link: string }[];
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)} className="inline-flex w-fit items-center gap-2">
        <span className={`text-white transition-all ${isOpen ? "text-sm font-normal" : "text-xl font-bold"}`}>
          {label}
        </span>
        <span
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
          className={` border-x-transparent border-t-white transition-all ${isOpen ? "border-x-4 border-t-[6px]" : "border-x-[6px] border-t-8"}`}
        />
      </button>
      <div
        className="relative overflow-hidden transition-[height] duration-300"
        style={{ height: isOpen ? ref.current?.scrollHeight : 0 }}
      >
        <div ref={ref} className="absolute left-0 top-0 flex flex-col gap-5 pt-5">
          {items.map((item) =>
            item.link.startsWith("http") ? (
              <a
                key={item.label}
                rel="noopener noreferrer"
                target="_blank"
                href={item.link}
                className="w-fit text-xl font-bold text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.link} className="w-fit text-xl font-bold text-white" onClick={onClick}>
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function PcDropdown({ label, items }: { label: string; items: { label: string; link: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6)],
    placement: "bottom",
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });

  const hover = useHover(context, { handleClose: safePolygon() });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  return (
    <>
      <button className="gap-medium inline-flex w-fit items-center" ref={refs.setReference} {...getReferenceProps()}>
        <span className="text-lg font-normal leading-[23.4px] tracking-[1px]">{label}</span>
        <span
          className="border-x-[4px] border-t-[5px] border-x-transparent border-t-white transition-transform"
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-50">
            <div
              className="flex flex-col gap-[30px] rounded-[30px] bg-black p-[30px]"
              style={styles}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              {items.map((item) =>
                item.link.startsWith("http") ? (
                  <a
                    key={item.label}
                    rel="noopener noreferrer"
                    target="_blank"
                    href={item.link}
                    className="text-lg font-normal leading-[23.4px] tracking-[1px] text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.link}
                    className="text-lg font-normal leading-[23.4px] tracking-[1px] text-white"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
