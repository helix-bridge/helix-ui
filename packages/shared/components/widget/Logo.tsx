import Image, { ImageProps } from 'next/image';
import { ChainConfig, LogoType } from '../../model';
import { getNetworkMode } from '../../utils';

interface LogoProps extends Omit<ImageProps, 'src'> {
  chain: ChainConfig;
  logoType?: LogoType;
}

export function Logo({ chain, logoType = 'main', ...rest }: LogoProps) {
  const mode = getNetworkMode(chain);
  const target = chain.logos.find((item) => item.mode === mode && item.type === logoType);

  return <Image {...rest} src={`/image/${target?.name ?? ''}`} />;
}
