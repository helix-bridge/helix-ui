import { Dropdown, Form, Menu, Select, Tag } from 'antd';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig } from '../../model';
import { getDisplayName } from '../../utils';
import { Icon } from '../widget/Icon';
import { Logo } from '../widget/Logo';

export type DestinationMode = 'default' | 'card';

interface DestinationProps {
  animationRandom?: number | null;
  className?: string;
  defaultLogo?: string;
  extra?: string | JSX.Element;
  mode?: DestinationMode;
  networks: ChainConfig[];
  onChange?: (net: ChainConfig | null) => void;
  title?: string;
  value?: ChainConfig | null;
}

export function Destination({ mode = 'default', ...rest }: DestinationProps) {
  return mode === 'default' ? <DestinationSelect {...rest} /> : <DestinationCard {...rest} />;
}

function DestinationCard({
  title,
  extra,
  networks,
  onChange,
  value,
  defaultLogo = 'network.png',
  animationRandom: animationRadom = null,
}: DestinationProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const whirl = 'animate-whirl';
  const whirlReverse = 'animate-whirl-reverse';

  useEffect(() => {
    const textRef = panelRef.current?.querySelector(`.bg-${value?.name}`);

    panelRef.current?.classList.remove(whirl);
    textRef?.classList.remove(whirlReverse);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        panelRef.current?.classList.add(whirl);
        textRef?.classList.add(whirlReverse);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationRadom]);

  return (
    <div className="flex-1">
      <p className="mb-2">{title}</p>
      <Dropdown
        trigger={['click']}
        className="relative cursor-pointer"
        overlay={
          <Menu
            onClick={({ key }) => {
              const target = networks.find((net) => getDisplayName(net) === key) ?? null;

              if (onChange) {
                onChange(target);
              }
            }}
          >
            <Menu.Item key="default">{t('Clear Selected')}</Menu.Item>
            {networks.map((item) => {
              const name = getDisplayName(item);

              return (
                <Menu.Item key={name}>
                  <span className="flex justify-between items-center">
                    <span className="capitalize mr-2">{name}</span>
                    {item.isTest && <Tag color="cyan">{t('Test')}</Tag>}
                  </span>
                </Menu.Item>
              );
            })}
          </Menu>
        }
      >
        <div
          ref={panelRef}
          className={
            'flex items-center justify-between text-lg p-2 pr-1 rounded-xl bg-gray-300 dark:bg-gray-800 max-w-full text-gray-800 dark:text-white'
          }
        >
          <div className={`rounded-xl flex flex-col gap-4 py-2 flex-1 mr-1 md:mr-4`}>
            <Logo chain={value} defaultLogo={defaultLogo} className="h-8 sm:h-12 md:16 ml-2 self-start" />
            <span className="capitalize mr-0 text-xs dark:text-white px-2 py-0.5 whitespace-nowrap">
              {!value ? t('Select Network') : getDisplayName(value)}
            </span>
          </div>

          <div className="flex flex-col gap-4 justify-between self-stretch pb-3 pr-2">
            <div className="flex">{extra}</div>
            <Icon
              name="down"
              className="flex self-end rounded-sm bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-white"
            />
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

function DestinationSelect({
  title,
  extra,
  networks,
  value,
  onChange,
  className,
  defaultLogo = 'image/network.png',
}: DestinationProps) {
  const { t } = useTranslation();

  return (
    <Form.Item label={title} rules={[{ required: true }]} className={'relative w-full ' + className}>
      <Select
        allowClear
        size="large"
        value={value ? getDisplayName(value) : undefined}
        placeholder={t('Select Network')}
        dropdownClassName="dropdown-networks"
        onChange={(key) => {
          const target = networks.find((net) => getDisplayName(net) === key) ?? null;

          if (onChange) {
            onChange(target);
          }
        }}
      >
        {networks.map((item) => {
          const name = getDisplayName(item);

          return (
            <Select.Option value={name} key={name}>
              <span className="flex items-center">
                <Logo chain={item} defaultLogo={defaultLogo} className="h-4 sm:h-6 md:16 mr-2" />
                <span className="flex-1 flex justify-between items-center">
                  <span className="capitalize mr-2">{name}</span>
                  {item.isTest && <Tag color="cyan">{t('Test')}</Tag>}
                </span>
              </span>
            </Select.Option>
          );
        })}
      </Select>
      {extra && <Form.Item className="absolute right-4 -top-9">{extra}</Form.Item>}
    </Form.Item>
  );
}
