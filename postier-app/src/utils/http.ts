import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {ContentType, KeyValue, RequestData, ResponseData} from '../types';
import axiosTauriApiAdapter from "axios-tauri-api-adapter";

export const formatHeaders = (headers: KeyValue[]): Record<string, string> => {
  return headers
    .filter(header => header.enabled)
    .reduce((acc, header) => {
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

export const sendRequest = async (requestData: RequestData): Promise<ResponseData> => {
  const { url, method, headers, body, contentType } = requestData;
  
  const formattedHeaders = formatHeaders(headers);
  
  // Add content type header if not already present and not 'none'
  if (contentType !== 'none' && !formattedHeaders['Content-Type']) {
    const contentTypeValue = getContentTypeHeader(contentType);
    if (contentTypeValue) {
      formattedHeaders['Content-Type'] = contentTypeValue;
    }
  }

  const config: AxiosRequestConfig = {
    url,
    method: method.toLowerCase(),
    headers: {...formattedHeaders, "User-Agent": "Postier@1.0.0"},
    data: formatRequestBody(body, contentType),
  };

  const startTime = performance.now();

  try {
    const response: AxiosResponse = await axios({...config, adapter: axiosTauriApiAdapter });
    const endTime = performance.now();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      data: response.data,
      time: endTime - startTime,
      size: JSON.stringify(response.data).length,
    };
  } catch (error: any) {
    const endTime = performance.now();
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers as Record<string, string>,
        data: error.response.data,
        time: endTime - startTime,
        size: JSON.stringify(error.response.data || '').length,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        statusText: 'No response received',
        headers: {},
        data: 'No response received from server',
        time: endTime - startTime,
        size: 0,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        statusText: 'Request Error',
        headers: {},
        data: error.message || 'Unknown error occurred',
        time: endTime - startTime,
        size: 0,
      };
    }
  }
}; 