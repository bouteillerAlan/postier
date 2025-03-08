import React, { createContext, useState, useContext, ReactNode } from "react";
import {PostierObject,} from "../types/types.ts";

// Shape of the context value
interface RequestDataContextType {
  requestData: PostierObject;
  setRequestData: React.Dispatch<React.SetStateAction<PostierObject>>;
}

// Context with default value
export const RequestDataContext = createContext<RequestDataContextType | null>(null);

// Provider
export const RequestDataProvider = ({ children }: { children: ReactNode }) => {
  const [requestData, setRequestData] = useState<PostierObject>({
    debug: [],
    request: {
      id: '',
      timestamp: 0,
      url: '',
      method: 'GET',
      headers: null,
      query: null,
      contentType: null,
      body: null
    },
    response: {
      id: '',
      timestamp: 0,
      status: 0,
      statusText: 'No request sent',
      headers: null,
      data: 'Send a request to see the response here.',
      time: 0,
      size: 0
    }
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
