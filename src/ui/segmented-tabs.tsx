import { Key, ReactElement, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import Tooltip from "./tooltip";

export interface SegmentedTabsProps<K> {
  activeKey: K;
  options: {
    key: K;
    label: ReactElement | string;
    children: ReactElement;
    disabled?: boolean;
  }[];
  className?: string;
  onChange?: (key: K) => void;
}

export default function SegmentedTabs<K extends Key = string>({
  options,
  activeKey,
  className,
  onChange = () => undefined,
}: SegmentedTabsProps<K>) {
  const previousRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(activeKey);

  const nodeRef = stateRef.current === activeKey ? currentRef : previousRef;
  stateRef.current = activeKey;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* labels */}
      <div className={`flex h-10 w-full ${className}`}>
        {options.map(({ key, label, disabled }) => (
          <div
            key={key}
            className={`flex flex-1 items-center justify-center border-y border-r border-primary transition-colors duration-150 first:rounded-l-middle first:border-l last:rounded-r-middle hover:border-primary/80 ${
              activeKey === key ? "bg-primary hover:bg-primary/80" : "bg-transparent hover:text-primary"
            } ${disabled ? "opacity-60" : ""}`}
          >
            <Tooltip enabled={!!disabled} content="Coming soon" className="h-full w-full">
              <button
                onClick={() => onChange(key)}
                className={`h-full w-full transition disabled:cursor-not-allowed`}
                disabled={disabled}
              >
                {typeof label === "string" ? (
                  <span className="text-sm font-medium lg:font-extrabold">{label}</span>
                ) : (
                  label
                )}
              </button>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* content */}
      <SwitchTransition>
        <CSSTransition timeout={200} key={activeKey} nodeRef={nodeRef} classNames="tabs-fade" unmountOnExit>
          <div ref={nodeRef} className="w-full">
            {options.find(({ key }) => key === activeKey)?.children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}