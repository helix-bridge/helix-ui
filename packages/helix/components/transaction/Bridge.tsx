import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { Network } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { getChainConfig, getDisplayName } from 'shared/utils/network';

export function Bridge() {
  const router = useRouter();

  const [departure, arrival] = useMemo(
    () => [getChainConfig(router.query.from as Network), getChainConfig(router.query.to as Network)],
    [router.query]
  );

  const bridge = getBridge([departure, arrival]);

  return (
    <div>
      <div
        className="grid grid-cols-5 gap-4 p-3 bg-gray-200 dark:bg-antDark bg-opacity-25"
        style={{ borderRadius: 40 }}
      >
        <Logo chain={departure} width={40} height={40} className="w-5 md:w-10" />
        <div
          className="flex items-center justify-center col-span-3 px-4 md:px-8 transform -translate-y-3 bg-gray-300 bg-opacity-20 dark:bg-blue-900 dark:bg-opacity-25"
          style={{
            clipPath: 'polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%, 0% 0%)',
            height: 'calc(100% + 24px)',
          }}
        >
          <Image src={`/image/bridges/${bridge.category}.png`} width={77} height={21} className="w-10 md:w-20" />
        </div>
        <Logo chain={arrival} width={40} height={40} className="w-5 md:w-10" />
      </div>

      <div className="flex justify-between text-xs capitalize mt-1 px-3 whitespace-nowrap">
        {[departure, arrival].map((item) => (
          <div key={item.name}>{getDisplayName(item)}</div>
        ))}
      </div>
    </div>
  );
}
