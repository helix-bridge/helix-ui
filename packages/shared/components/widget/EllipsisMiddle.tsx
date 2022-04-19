import { Typography } from 'antd';
import { PropsWithChildren, useEffect, useRef } from 'react';

const ellipse = (containerWidth: number, childNode: HTMLSpanElement, txtNode: HTMLElement, deviation = 0) => {
  const childWidth = childNode.offsetWidth;
  const txtWidth = txtNode.offsetWidth;
  const targetWidth = childWidth > txtWidth ? childWidth : txtWidth;

  if (targetWidth > containerWidth - deviation) {
    const str = txtNode.textContent as string;
    const txtChars = str.length;
    const avgLetterSize = txtWidth / txtChars;
    const canFit = (containerWidth - (targetWidth - txtWidth)) / avgLetterSize;
    /* eslint-disable no-magic-numbers */
    const delEachSide = (txtChars - canFit + 5) / 2;
    const endLeft = Math.floor(txtChars / 2 - delEachSide);
    const startRight = Math.ceil(txtChars / 2 + delEachSide);
    /* eslint-enable no-magic-numbers */

    txtNode.setAttribute('data-original', txtNode.textContent as string);
    txtNode.textContent = str.slice(0, endLeft) + '...' + str.slice(startRight);
  }
};

interface EllipsisMiddleProps {
  className?: string;
  percent?: number;
  width?: number;
  copyable?: boolean;
  isGrow?: boolean;
  deviation?: number;
}

export function EllipsisMiddle({
  children,
  className,
  width,
  copyable = false,
  isGrow = false,
  deviation = 0,
}: PropsWithChildren<EllipsisMiddleProps>) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line complexity
  const prepEllipse = (node: HTMLDivElement) => {
    const parent = node.parentNode;
    const child = node.childNodes[0];
    let txtToEllipse;

    try {
      txtToEllipse = (parent && parent.querySelector('.ellipseMe')) || child;
    } catch {
      //
    }

    if (child !== null && txtToEllipse) {
      // (Re)-set text back to data-original-text if it exists.
      if ((txtToEllipse as HTMLElement).hasAttribute('data-original')) {
        txtToEllipse.textContent = (txtToEllipse as HTMLElement).getAttribute('data-original');
      }

      const copyDiv = (txtToEllipse as HTMLElement).querySelector('.ant-typography-copy') as HTMLDivElement;

      if (copyDiv) {
        (txtToEllipse as HTMLSpanElement).style.display = 'flex';
        (txtToEllipse as HTMLSpanElement).style.alignItems = 'center';
        copyDiv.style.display = 'flex';
        copyDiv.style.color = 'inherit';
      }

      const nodeWidth = node.offsetWidth;
      const parentWidth = (parent as HTMLElement).offsetWidth;
      let containerWidth = isGrow ? Math.max(nodeWidth, parentWidth) : Math.min(nodeWidth, parentWidth);

      if (containerWidth === 0) {
        containerWidth = Math.max(nodeWidth, parentWidth);
      }

      ellipse(containerWidth, child as HTMLSpanElement, txtToEllipse as HTMLElement, deviation);
    }
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const node = ref.current as HTMLDivElement;
    const listener = () => prepEllipse(node);

    if (node !== null && typeof window !== 'undefined') {
      window.addEventListener('resize', listener);
      prepEllipse(node);
    }

    return () => window.removeEventListener('resize', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      style={{
        wordBreak: 'keep-all',
        overflowWrap: 'normal',
        ...(width && { width }),
      }}
      className={`${className}`}
    >
      <Typography.Text copyable={copyable} className="ellipseMe whitespace-nowrap">
        {children}
      </Typography.Text>
    </div>
  );
}
