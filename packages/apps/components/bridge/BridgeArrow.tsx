import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { BridgeCategory } from 'shared/model';

interface BridgeArrowProps {
  category: BridgeCategory;
  showName?: boolean;
}
export function BridgeArrow({ category, showName = true }: BridgeArrowProps) {
  const asHistory = !showName;

  return (
    <div className={asHistory ? 'flex justify-center px-4 flex-1' : ''}>
      <div className={`relative hidden lg:flex justify-center text-white ${!asHistory ? 'w-56' : 'w-1/2'}`}>
        <div
          className={`${
            showName ? 'py-1 w-24 rounded-3xl' : 'p-2 w-auto rounded-full'
          } bg-gray-700 flex justify-center items-center space-x-2 z-10`}
        >
          <Image alt="..." src={`/image/${category}-bridge.svg`} width={28} height={28} />
          {showName && <strong className="capitalize">{category}</strong>}
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
