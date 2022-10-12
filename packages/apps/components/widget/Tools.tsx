import { Dropdown, Menu } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useITranslation } from 'shared/hooks/translation';
import { Path } from '../../config';

export function Tools() {
  const { t } = useITranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      open={open}
      placement="bottomRight"
      overlay={
        <Menu
          onClick={() => setOpen(true)}
          items={[
            {
              label: <span onClick={() => router.push(Path.claimTool)}>{t('Claim Tool')}</span>,
              key: 'claim',
            },
          ]}
        />
      }
      onOpenChange={(isVisible) => {
        setOpen(isVisible);
      }}
    >
      <span>{t('Tools')}</span>
    </Dropdown>
  );
}
