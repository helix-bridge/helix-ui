import { Key, ReactElement, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface SegmentedTabsProps<K> {
  activeKey: K;
  options: {
    key: K;
    label: ReactElement | string;
    children: ReactElement;
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
      <div className={`border-primary flex h-10 w-full rounded border ${className}`}>
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`h-full flex-1 transition hover:opacity-80 ${
              activeKey === key ? "bg-primary" : "bg-transparent"
            }`}
          >
            {typeof label === "string" ? <span className="text-sm font-medium">{label}</span> : label}
          </button>
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
