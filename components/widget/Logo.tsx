import Image, { ImageProps } from 'next/image';
import { ChainConfig } from '../../model';
import { isDVM } from '../../utils';

interface LogoProps extends Omit<ImageProps, 'src'> {
  chain: ChainConfig;
}

export function Logo({ chain, ...rest }: LogoProps) {
  const src = isDVM(chain) ? chain.facade.logoSmart ?? chain.facade.logo : chain.facade.logo;

  return <Image {...rest} src={src} />;
}
