import React, { createContext, useState, useContext, ReactNode } from 'react';
import {UserSetting} from '../types/types.ts';

interface SettingContextType {
  setting: UserSetting;
  setSetting: React.Dispatch<React.SetStateAction<UserSetting>>;
}

export const SettingContext = createContext<SettingContextType | null>(null);

export const SettingProvider = ({ children }: { children: ReactNode }) => {
  const [setting, setSetting] = useState<UserSetting>({codeTheme: 'duotoneDark', theme: 'auto'});

  return (
    <SettingContext.Provider value={{ setting, setSetting }}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => {
  const context = useContext(SettingContext);
  if (!context) throw new Error('useSetting must be used within a SettingProvider');
  return context;
};
