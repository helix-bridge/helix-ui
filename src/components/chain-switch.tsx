import { getChainConfig, getChainConfigs, getChainLogoSrc } from "@/utils";
import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

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

  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const activeChain = useMemo(() => getChainConfig(chain?.id), [chain?.id]);

  return (
    <>
      <button
        className="flex w-fit items-center justify-between gap-small rounded-[0.625rem] bg-white/20 px-medium py-2 transition-colors hover:bg-white/[0.25] lg:py-small"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {activeChain ? (
          <>
            <Image alt="Active chain" width={20} height={20} src={getChainLogoSrc(activeChain.logo)} />
            <Image
              style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
              className="shrink-0 transition-transform"
              src="/images/caret-down.svg"
              alt="Caret down"
              width={16}
              height={16}
            />
          </>
        ) : (
          <>
            <Image alt="Wrong chain" width={18} height={18} src="/images/warning.svg" />
            <span className="text-sm font-bold text-orange-400">Wrong Chain</span>
          </>
        )}
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              style={styles}
              className="app-scrollbar flex max-h-[18rem] flex-col overflow-y-auto rounded-xl bg-inner py-2"
              onClick={() => setIsOpen(false)}
            >
              {chainOptions.map((option) => (
                <button
                  className="flex items-center gap-medium px-large py-medium transition-colors hover:bg-white/10 disabled:bg-white/10"
                  disabled={option.id === chain?.id}
                  key={option.id}
                  onClick={() => switchNetwork?.(option.id)}
                >
                  <Image alt="Chain" width={20} height={20} src={getChainLogoSrc(option.logo)} />
                  <span className="text-sm font-bold text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
