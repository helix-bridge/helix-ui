import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { ChainConfig, LogoType } from '../../model';

interface LogoProps extends Omit<ImageProps, 'src'> {
  chain?: ChainConfig | null | undefined;
  name?: string;
  logoType?: LogoType;
}

export function Logo({ chain, logoType = 'main', name = '', ...rest }: LogoProps) {
  const [logo, setLogo] = useState(name);

  useEffect(() => {
    if (!chain) {
      return;
    }

    const target = chain.logos.find((item) => item.type === logoType);

    if (target) {
      setLogo(target.name);
    }
  }, [chain, logoType]);

  return <Image {...rest} src={`/image/${name || logo}`} />;
}
