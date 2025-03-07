import React, { createContext, useState, useContext, ReactNode } from "react";
import {RequestHistoryItem} from "../types/types.ts";

interface HistoryDataContextType {
  historyData: RequestHistoryItem;
  setHistoryData: React.Dispatch<React.SetStateAction<RequestHistoryItem>>;
}

export const HistoryDataContext = createContext<HistoryDataContextType | undefined>(undefined);

export const HistoryDataProvider = ({ children }: { children: ReactNode }) => {
  const [historyData, setHistoryData] = useState<RequestHistoryItem>({
    body: '',
    contentType: 'none',
    debug: null,
    headers: [],
    id: '',
    method: 'GET',
    query: [],
    response: null,
    timestamp: 0,
    url: ''
  });

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
