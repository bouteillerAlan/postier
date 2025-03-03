import React, { createContext, useState, useContext, ReactNode } from "react";
import { HttpMethod, ContentType, RequestDataWithQuery } from "../types";

// Shape of the context value
interface RequestDataContextType {
  requestData: RequestDataWithQuery;
  setRequestData: React.Dispatch<React.SetStateAction<RequestDataWithQuery>>;
}

// Context with default value
export const RequestDataContext = createContext<RequestDataContextType | undefined>(undefined);

// Provider
export const RequestDataProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<RequestDataWithQuery>({
    id: '',
    url: '',
    method: 'GET' as HttpMethod,
    headers: [],
    body: '',
    contentType: 'json' as ContentType,
    query: []
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
  if (!context) {
    throw new Error('useRequestData must be used within a RequestDataProvider');
  }
  return context;
};
