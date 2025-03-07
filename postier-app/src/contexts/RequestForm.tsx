import React, { createContext, useState, useContext, ReactNode } from "react";
import {RequestDataWithResponse,} from "../types/types.ts";

// Shape of the context value
interface RequestDataContextType {
  requestData: RequestDataWithResponse;
  setRequestData: React.Dispatch<React.SetStateAction<RequestDataWithResponse>>;
}

// Context with default value
export const RequestDataContext = createContext<RequestDataContextType | undefined>(undefined);

// Provider
export const RequestDataProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<RequestDataWithResponse>({
    id: '',
    url: '',
    method: 'GET',
    headers: [],
    body: '',
    contentType: 'json',
    query: [],
    response: null,
    debug: null
  });

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
