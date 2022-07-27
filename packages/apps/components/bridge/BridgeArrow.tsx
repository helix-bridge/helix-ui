import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { BridgeCategory } from 'shared/model';

interface BridgeArrowProps {
  category: BridgeCategory;
  showName?: boolean;
}
// eslint-disable-next-line complexity
export function BridgeArrow({ category, showName = true }: BridgeArrowProps) {
  const asHistory = !showName;
  const logoProps =
    category === 'helix'
      ? {
          width: 28,
          height: 28,
        }
      : {
          width: 44,
          height: 28,
        };

  return (
    <div className={asHistory ? 'flex justify-center mx-4 flex-1 relative' : ''}>
      <div className={`relative hidden lg:flex justify-center text-white ${!asHistory ? 'w-56' : 'w-1/2'}`}>
        <div
          className={`${
            !asHistory ? 'rounded-3xl' : 'rounded-full'
          } px-2.5 bg-gray-700 flex justify-center items-center z-10`}
        >
          <Image alt="..." src={`/image/bridges/${category}-bridge.png`} {...logoProps} />
          {!asHistory && <strong className={`${category === 'helix' ? 'capitalize' : ''} ml-2`}>{category}</strong>}
        </div>

        <Image alt="..." src="/image/bridge-to.svg" layout="fill" priority />
      </div>

      <div
        className={`lg:hidden absolute top-0 bottom-0 left-0 right-0 m-auto w-7 flex items-end justify-center pb-3 opacity-40`}
      >
        <ArrowRightOutlined />
      </div>
    </div>
  );
}
