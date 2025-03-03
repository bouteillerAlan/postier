import {ContentType, KeyValue, RequestData} from '../types/types.ts';
import { fetch } from '@tauri-apps/plugin-http';

export const formatHeaders = (headers: KeyValue[]): Record<string, string> => {
  return headers
    .filter((header: KeyValue): boolean => header.enabled && header.key.trim().length > 0 && header.value.trim().length > 0)
    .reduce((acc: Record<string, string>, header: KeyValue) => {
      acc[header.key] = header.value;
      return acc;
    }, {} as Record<string, string>);
};

export const getContentTypeHeader = (contentType: ContentType): string => {
  switch (contentType) {
    case 'form-data':
      return 'multipart/form-data';
    case 'text':
      return 'text/plain';
    case 'javascript':
      return 'application/javascript';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'xml':
      return 'application/xml';
    case 'none':
    default:
      return '';
  }
};

export const formatRequestBody = (body: string, contentType: ContentType): any => {
  if (contentType === 'none' || !body) {
    return undefined;
  }

  if (contentType === 'json') {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return body;
    }
  }

  return body;
};

export const sendRequest = async (requestData: RequestData): Promise<{
  status: number;
  statusText: string;
  headers: Headers| null;
  data: string | null;
  time: number;
  size: number
}> => {
  const { url, method, headers, body, contentType } = requestData;
  
  const formattedHeaders: Record<string, string> = formatHeaders(headers);
  
  // Add content type header if not already present and not 'none'
  if (contentType !== 'none' && !formattedHeaders['Content-Type']) {
    const contentTypeValue: string = getContentTypeHeader(contentType);
    if (contentTypeValue) {
      formattedHeaders['Content-Type'] = contentTypeValue;
    }
  }

  const config = {
    method: method.toLowerCase(),
    headers: {...formattedHeaders, "User-Agent": "PostierRuntime/1.0.0"},
    data: formatRequestBody(body, contentType),
  };

  const startTime: number = performance.now();

  try {
    const response: Response = await fetch(url, {...config});
    const endTime: number = performance.now();
    const body: string = await response.text();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: body,
      time: endTime - startTime,
      size: JSON.stringify(response.body).length,
    };
  } catch (error: any) {
    const endTime = performance.now();
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        time: endTime - startTime,
        size: JSON.stringify(error.response.data || '').length,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        statusText: 'No response received',
        headers: null,
        data: null,
        time: endTime - startTime,
        size: 0,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        statusText: `Request Error: ${error.message}`,
        headers: null,
        data: null,
        time: endTime - startTime,
        size: 0,
      };
    }
  }
}; 