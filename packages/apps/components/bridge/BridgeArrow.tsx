import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { BridgeCategory } from 'shared/model';
import { asSameCategory } from '../../utils';

interface BridgeArrowProps {
  category: BridgeCategory;
  showName?: boolean;
}
// eslint-disable-next-line complexity
export function BridgeArrow({ category, showName = true }: BridgeArrowProps) {
  const asHistory = !showName;
  const logoProps = asSameCategory(category, 'helix')
    ? {
        width: 28,
        height: 28,
      }
    : {
        width: 44,
        height: 28,
      };

  return (
    <div
      className={asHistory ? 'flex justify-center items-center mx-4 flex-1 relative' : ''}
      style={{
        width: asHistory ? 'auto' : 'max(33%, 150px)',
      }}
    >
      <div className={`bridge-arrow hidden lg:flex justify-center text-white ${!asHistory ? 'w-56' : 'w-1/2'}`}>
        <div
          className={`${
            !asHistory ? 'px-2.5 rounded-3xl' : 'rounded-full  p-2'
          } bg-gray-700 flex justify-center items-center z-10`}
          style={{ height: 'fit-content', transform: asHistory ? 'translateY(-22px)' : 'translateY(-19px)' }}
        >
          <Image alt="..." src={`/image/bridges/${category.split('-')[0]}-bridge.png`} {...logoProps} />
          {!asHistory && (
            <strong className={`${asSameCategory(category, 'helix') ? 'capitalize' : ''} ml-2`}>
              {category.split('-')[0]}
            </strong>
          )}
        </div>
      </div>

      <div
        className={`lg:hidden absolute top-0 bottom-0 left-0 right-0 m-auto w-7 flex items-end justify-center pb-3 opacity-40`}
      >
        <ArrowRightOutlined />
      </div>
    </div>
  );
}
