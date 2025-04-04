import React, { createContext, useState, useContext, ReactNode } from 'react'
import {PostierObjectWithMetrics} from '../types/types.ts'

interface HistoryDataContextType {
  historyData: PostierObjectWithMetrics[];
  setHistoryData: React.Dispatch<React.SetStateAction<PostierObjectWithMetrics[]>>;
}

export const HistoryDataContext = createContext<HistoryDataContextType | null>(null);

export const HistoryDataProvider = ({ children }: { children: ReactNode }) => {
  const [historyData, setHistoryData] = useState<PostierObjectWithMetrics[]>([]);

  return (
    <HistoryDataContext.Provider value={{ historyData, setHistoryData }}>
      {children}
    </HistoryDataContext.Provider>
  );
};

export const useHistoryData = () => {
  const context = useContext(HistoryDataContext);
  if (!context) throw new Error('useHistoryData must be used within a HistoryDataProvider');
  return context;
};
