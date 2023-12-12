import Image from "next/image";
import { Key, ReactElement, useEffect, useRef, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface TabsProps<K> {
  activeKey: K;
  options: {
    key: K;
    label: ReactElement | string;
    children: ReactElement;
  }[];
  className?: string;
  onChange?: (key: K) => void;
}

export default function Tabs<K extends Key = string>({
  options,
  activeKey,
  className,
  onChange = () => undefined,
}: TabsProps<K>) {
  const [dividerWidth, setDividerWidth] = useState<number | undefined>();

  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);

  const previousRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(activeKey);

  const nodeRef = stateRef.current === activeKey ? currentRef : previousRef;
  stateRef.current = activeKey;
  const activeItem = options.find(({ key }) => key === activeKey) || options.at(0);

  useEffect(() => {
    const labelElement = labelRefs.current[options.findIndex(({ key }) => key === activeKey)];
    const railElement = railRef.current;

    if (labelElement && railElement) {
      railElement.style.transform = `translateX(${labelElement.offsetLeft}px)`;
      railElement.style.width = `${labelElement.clientWidth}px`;
    }
  }, [options, activeKey]);

  return (
    <div className={className}>
      {/* labels */}
      <div className="overflow-x-auto">
        <div className="options-center relative flex gap-middle" ref={(node) => setDividerWidth(node?.scrollWidth)}>
          {options.map(({ key, label }, index) => (
            <button
              key={key}
              type="button"
              ref={(node) => (labelRefs.current[index] = node)}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
              }}
              className={`rounded-middle px-3 py-1 text-sm transition duration-200 hover:bg-white/10 ${
                key === activeKey ? "font-extrabold text-primary" : "font-medium text-white"
              }`}
            >
              {typeof label === "string" ? <span>{label}</span> : label}
            </button>
          ))}
        </div>

        {/* divider & rail */}
        <div className="relative mt-middle" style={{ width: dividerWidth }}>
          <div className="absolute h-[2px] w-6 bg-primary transition-transform duration-200" ref={railRef} />
          <div className="h-[1px] bg-transparent" />
          <div className="h-[1px] bg-white/20" />
        </div>
      </div>

      {/* content */}
      <SwitchTransition>
        <CSSTransition timeout={200} key={activeKey} nodeRef={nodeRef} classNames="tabs-fade" unmountOnExit>
          <div ref={nodeRef} className="mt-middle overflow-x-auto">
            {activeItem ? (
              activeItem.children
            ) : (
              <div className="options-center flex flex-col gap-large pt-10">
                <Image width={50} height={63} alt="No data" src="/images/no-data.svg" />
                <span className="text-sm font-medium text-white/50">No data</span>
              </div>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
