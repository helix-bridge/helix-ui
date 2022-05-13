import React, { createContext, useCallback, useContext, useState } from 'react';
import { getInitialSetting, updateStorage } from 'shared/utils/helper';

export interface ConfigCtx {
  enableTestNetworks: boolean;
  setEnableTestNetworks: (enable: boolean) => void;
}

const isDev = process.env.REACT_APP_HOST_TYPE === 'dev';
const isEnable = !!getInitialSetting('enableTestNetworks', isDev);

export const ConfigContext = createContext<ConfigCtx | null>(null);

export const ConfigProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [enableTestNetworks, setEnable] = useState<boolean>(isEnable);

  const setEnableTestNetworks = useCallback((payload: boolean) => {
    setEnable(payload);
    updateStorage({ enableTestNetworks: payload });
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        enableTestNetworks,
        setEnableTestNetworks,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext) as Exclude<ConfigCtx, null>;
