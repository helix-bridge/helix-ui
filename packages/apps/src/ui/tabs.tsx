import Image from "next/image";
import { Key, ReactElement, useEffect, useRef, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface TabsProps<K> {
  activeKey: K;
  options: {
    key: K;
    label: ReactElement;
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
        <div className="options-center relative flex gap-5" ref={(node) => setDividerWidth(node?.scrollWidth)}>
          {options.map(({ key, label }, index) => (
            <button
              key={key}
              type="button"
              ref={(node) => (labelRefs.current[index] = node)}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
              }}
              className={`rounded-lg px-3 py-1 text-sm transition duration-200 hover:bg-white/10 ${
                key === activeKey ? "text-primary font-bold" : "font-light text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* divider & rail */}
        <div className="mt-middle relative" style={{ width: dividerWidth }}>
          <div className="bg-primary absolute h-[2px] w-6 transition-transform duration-200" ref={railRef} />
          <div className="h-[1px] bg-transparent" />
          <div className="bg-line h-[1px]" />
        </div>
      </div>

      {/* content */}
      <SwitchTransition>
        <CSSTransition timeout={200} key={activeKey} nodeRef={nodeRef} classNames="tabs-fade" unmountOnExit>
          <div ref={nodeRef} className="mt-middle overflow-x-auto">
            {activeItem ? (
              activeItem.children
            ) : (
              <div className="gap-large options-center flex flex-col pt-10">
                <Image width={50} height={63} alt="No data" src="/images/no-data.svg" />
                <span className="text-sm font-light text-white/50">No data</span>
              </div>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
