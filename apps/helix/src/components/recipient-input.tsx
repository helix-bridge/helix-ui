import { Address, isAddress } from "viem";
import WalletSVG from "./icons/wallet-svg";
import { ChangeEventHandler, useCallback, useState } from "react";
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
import { useEnsName } from "wagmi";

interface Value {
  input: string;
  value: Address | undefined;
  alert?: string;
}

interface Props {
  value?: Value;
  options?: Address[];
  onChange?: (value: Value) => void;
}

export default function RecipientInput({ value, options = [], onChange = () => undefined }: Props) {
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
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.value) {
        const input = e.target.value;
        const alert = isAddress(input) ? undefined : "* Invalid address";
        onChange({ input, alert, value: isAddress(input) ? input : undefined });
      } else {
        onChange({ input: "", value: undefined, alert: "* Require recipient" });
      }
    },
    [onChange],
  );

  return (
    <>
      <div
        className="mx-medium gap-small px-medium group flex items-center justify-between rounded-[0.625rem] bg-[#1F282C] py-2 transition-colors focus-within:bg-white/10 hover:bg-white/10"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <div className="gap-small flex w-full items-center lg:gap-2">
          <WalletSVG
            width={20}
            height={20}
            className="opacity-50 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          />
          <input
            placeholder="Recipient"
            value={value?.input ?? ""}
            className="w-full bg-transparent text-sm font-medium text-white/50 transition-colors focus-visible:outline-none group-focus-within:text-white group-hover:text-white"
            onChange={handleChange}
          />
        </div>
        <img
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
          className="shrink-0 opacity-50 transition-[transform,opacity] group-focus-within:opacity-100 group-hover:opacity-100"
          src="images/caret-down.svg"
          alt="Caret down"
          width={16}
          height={16}
        />
      </div>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              className="rounded-xl border border-white/20 bg-[#00141D] py-2"
              style={styles}
              onClick={() => setIsOpen(false)}
            >
              {options.length ? (
                options.map((option) => <Option key={option} address={option} onSelect={onChange} />)
              ) : (
                <div className="py-small flex items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-400">No data</span>
                </div>
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function Option({ address, onSelect }: { address: Address; onSelect: (value: Value) => void }) {
  const { data: name } = useEnsName({ address });
  return (
    <button
      className="py-small w-full truncate px-2 text-start transition-colors hover:bg-white/10"
      onClick={() => onSelect({ input: address, value: address, alert: undefined })}
    >
      <span className="text-sm font-semibold text-white">{name ?? address}</span>
    </button>
  );
}
