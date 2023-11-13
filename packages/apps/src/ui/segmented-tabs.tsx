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
            className={`border-primary flex flex-1 items-center justify-center border-y border-r transition-colors first:rounded-l-xl first:border-l last:rounded-r-xl ${
              activeKey === key ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Tooltip enabled={!!disabled} content="Coming soon">
              <button
                onClick={() => onChange(key)}
                className={`h-full w-full transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={disabled}
              >
                {typeof label === "string" ? <span className="text-sm font-medium">{label}</span> : label}
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
