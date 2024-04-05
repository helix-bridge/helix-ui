import { getChainConfigs } from "@/utils";
import { offset, useClick, useDismiss, useFloating, useInteractions, useTransitionStyles } from "@floating-ui/react";
import { useMemo, useState } from "react";
import { useNetwork } from "wagmi";

const chainOptions = getChainConfigs();

export default function ChainSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6)],
  });
  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { chain } = useNetwork();
  // const activeChain = useMemo(() => chainOptions.find((option) => option.id === chain?.id))

  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}></button>
    </>
  );
}
