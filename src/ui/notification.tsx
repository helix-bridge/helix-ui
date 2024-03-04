import Image from "next/image";
import { ReactElement } from "react";
import { createRoot } from "react-dom/client";

interface Config {
  title?: ReactElement | string | null;
  description?: ReactElement | string | null;
  duration?: number; // In millisecond
  closeable?: boolean;
  className?: string;
  onClose?: () => void;
}

type Status = "success" | "info" | "warn" | "error";

const createContainer = () => {
  const container = document.createElement("div");
  container.className = "fixed top-medium right-medium lg:top-5 lg:right-5 flex flex-col overflow-hidden z-40";
  document.body.appendChild(container);
  return container;
};

const createItem = (config: Config, status: Status, onClose: () => void) => {
  const domNode = document.createElement("div");
  domNode.className = `rounded-medium border-component border bg-inner p-medium lg:p-5 flex items-center gap-medium mb-medium animate-notification-enter relative w-[82vw] lg:w-96 ${config.className}`;

  const root = createRoot(domNode);
  root.render(
    <>
      <Image
        alt={status}
        width={20}
        height={20}
        src={`/images/notification/${status}.svg`}
        className="shrink-0 self-start lg:hidden"
      />
      <Image
        alt={status}
        width={24}
        height={24}
        src={`/images/notification/${status}.svg`}
        className="hidden shrink-0 self-start lg:inline"
      />
      <div className="flex flex-col gap-small">
        {config.title && <div className="break-all text-base font-medium text-white">{config.title}</div>}
        {config.description && <div className="break-all text-sm font-medium text-white">{config.description}</div>}
      </div>
      {config.closeable && (
        <button
          onClick={onClose}
          className="absolute right-1 top-1 rounded-full bg-transparent p-[2px] transition-transform hover:scale-105 hover:bg-white/10 active:scale-95 lg:right-2 lg:top-2"
        >
          <Image alt="Close" width={16} height={16} src="/images/close-white.svg" />
        </button>
      )}
    </>,
  );
  return { domNode, root };
};

const defaultDuration = 4500; // 4.5s
let notificationCount = 0;
let notificationContainer: HTMLElement | null = null;

const notificationInstance = (config: Config, status: Status) => {
  if (!notificationContainer) {
    notificationContainer = createContainer();
  }

  const { domNode: thisItem, root: thisRoot } = createItem(config, status, () => {
    thisItem.classList.add("animate-notification-leave");
  });
  const wrapper = document.createElement("div");
  wrapper.appendChild(thisItem);

  notificationContainer.appendChild(wrapper);
  notificationCount += 1;

  let isTimeout = false;
  let isHovering = false;

  thisItem.addEventListener("mouseenter", () => {
    isHovering = true;
  });
  thisItem.addEventListener("mouseleave", () => {
    isHovering = false;
    if (isTimeout) {
      setTimeout(() => {
        thisItem.classList.add("animate-notification-leave");
      }, 400);
    }
  });

  thisItem.addEventListener("animationend", (e) => {
    e.stopPropagation();
    if (thisItem.classList.contains("animate-notification-enter")) {
      thisItem.classList.remove("animate-notification-enter");
    } else {
      wrapper.style.height = `${thisItem.offsetHeight}px`;
      thisRoot.unmount();
      thisItem.remove();
      config.onClose && config.onClose();
      wrapper.classList.add("animate-notification-fadeout");
    }
  });

  wrapper.addEventListener("animationend", () => {
    wrapper.remove();
    notificationCount -= 1;

    if (notificationCount === 0) {
      notificationContainer?.remove();
      notificationContainer = null;
    }
  });

  const closer = () => {
    thisItem.classList.add("animate-notification-leave");
  };

  if (config.duration !== 0) {
    setTimeout(
      () => {
        isTimeout = true;
        if (!isHovering) {
          thisItem.classList.add("animate-notification-leave");
        }
      },
      config.duration && config.duration > 1000 ? config.duration : defaultDuration,
    );
  }

  return closer;
};

export const notification = {
  error: (config: Config) => notificationInstance(config, "error"),
  warn: (config: Config) => notificationInstance(config, "warn"),
  info: (config: Config) => notificationInstance(config, "info"),
  success: (config: Config) => notificationInstance(config, "success"),
};
