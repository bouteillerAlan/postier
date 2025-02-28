import React, { useState } from 'react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import axios, { AxiosResponse } from 'axios';
import './App.css';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';

interface RequestData {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

function App() {
  const [response, setResponse] = useState<AxiosResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (requestData: RequestData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios({
        url: requestData.url,
        method: requestData.method,
        headers: requestData.headers,
        data: requestData.body
      });
      setResponse(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Theme>
      <div className="container">
        <div className="request-panel">
          <RequestPanel onRequest={handleRequest} />
        </div>
        <div className="response-panel">
          <ResponsePanel response={response} error={error} isLoading={isLoading} />
        </div>
      </div>
    </Theme>
  );
}

export default App; 