import React, { createContext, useState, useContext, ReactNode } from 'react';
import {PostierObjectWithMetrics} from '../types/types.ts';
import {getDefaultRequest} from "../services/defaultData.ts";

// Shape of the context value
interface RequestDataContextType {
  requestData: PostierObjectWithMetrics[];
  setRequestData: React.Dispatch<React.SetStateAction<PostierObjectWithMetrics[]>>;
}

// Context with default value
export const RequestDataContext = createContext<RequestDataContextType | null>(null);

// Provider
export const RequestDataProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<PostierObjectWithMetrics[]>([getDefaultRequest()]);

  return (
    <RequestDataContext.Provider value={{ requestData, setRequestData }}>
      {children}
    </RequestDataContext.Provider>
  );
};

// Custom hook to use the request data context
export const useRequestData = () => {
  const context = useContext(RequestDataContext);
  if (!context) throw new Error('useRequestData must be used within a RequestDataProvider');
  return context;
};
