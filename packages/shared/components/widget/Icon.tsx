import { useEffect, useRef } from 'react';
import { HelixIcons } from '../../model/icon';
import iconfont from './icon/iconfont';

export function Icon({
  onClick,
  name,
  className = 'w-4 h-4',
}: {
  name: HelixIcons;
  onClick?: () => void;
  className?: string;
}) {
  const svgXML = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const parser = new DOMParser();
    const resXML = parser.parseFromString(iconfont, 'text/xml');
    const zeroXML = resXML.querySelector('#dwa-' + name);

    if (zeroXML && svgXML.current) {
      svgXML.current.innerHTML = zeroXML.innerHTML;
      svgXML.current.setAttribute('id', zeroXML.getAttribute('id') as string);
      svgXML.current.setAttribute('viewBox', zeroXML.getAttribute('viewBox') as string);
    }
  }, [name]);

  return <svg className={`icon ${className}`} onClick={() => onClick && onClick()} ref={svgXML}></svg>;
}
