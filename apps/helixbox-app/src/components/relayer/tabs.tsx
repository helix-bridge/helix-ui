import Tooltip from "../../ui/tooltip";
import { Key, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface Props<K> {
  activeKey: K;
  options: {
    label: JSX.Element | string;
    children: JSX.Element;
    disabled?: boolean;
    hidden?: boolean;
    key: K;
  }[];
  className?: string;
  onChange?: (key: K) => void;
}

export default function Tabs<K extends Key = string>({
  options,
  activeKey,
  className,
  onChange = () => undefined,
}: Props<K>) {
  const previousRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const activeKeyRef = useRef(activeKey);

  const nodeRef = activeKeyRef.current === activeKey ? currentRef : previousRef;
  activeKeyRef.current = activeKey;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className={`flex h-10 w-full ${className}`}>
        {options
          .filter(({ hidden }) => !hidden)
          .map(({ key, label, disabled }) => (
            <div
              key={key}
              className={`border-primary flex flex-1 items-center justify-center border-y border-r transition-colors duration-100 first:rounded-l-full first:border-l last:rounded-r-full ${
                activeKey === key ? "bg-primary" : "hover:bg-primary/50 bg-transparent"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <Tooltip enabled={!!disabled} content="Coming soon" className="h-full w-full">
                <button
                  onClick={() => onChange(key)}
                  className={`h-full w-full ${
                    activeKey === key ? "disabled:cursor-default" : "disabled:cursor-not-allowed"
                  }`}
                  disabled={disabled || activeKey === key}
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

      <SwitchTransition>
        <CSSTransition timeout={150} key={activeKey} nodeRef={nodeRef} classNames="tabs-fade" unmountOnExit>
          <div ref={nodeRef} className="w-full">
            {options.find(({ key }) => key === activeKey)?.children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
