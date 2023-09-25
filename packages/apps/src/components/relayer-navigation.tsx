import { useToggle } from "@/hooks/use-toggle";
import Link from "next/link";
import { useEffect, useRef } from "react";

const navigationsConfig: { label: string; href: string }[] = [
  { href: "/relayer/overview", label: "Overview" },
  { href: "/relayer/register", label: "Register" },
];

interface Props {
  onClose?: () => void;
}

export default function RelayerNavigation({ onClose = () => undefined }: Props) {
  return (
    <>
      <Mobile onClose={onClose} />
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
        <div
          className={`w-0 border-x-[5px] border-b-0 border-t-8 border-white border-x-transparent transition-transform duration-300`}
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </button>

      <div
        className="border-l-line gap-small flex flex-col overflow-hidden border-l transition-[height_padding]"
        ref={nodeRef}
      >
        {navigationsConfig.map(({ href, label }) => (
          <Link key={label} href={href} className="text-sm font-medium hover:underline" onClick={onClose}>
            {"> "}
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
