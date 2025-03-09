import {ContentType, KeyValue, PostierObject, RequestData, ResponseData} from '../types/types.ts';
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

export const sendRequest = async (requestData: RequestData): Promise<PostierObject> => {
  const { composedUrl, method, headers, body, contentType } = requestData;
  const url = composedUrl;

  const formattedHeaders: Record<string, string> | null = headers ? formatHeaders(headers) : null;

  // Add content type header if not already present and not 'none'
  if (formattedHeaders) {
    if (contentType && contentType !== 'none' && !formattedHeaders['Content-Type']) {
      const contentTypeValue: string = getContentTypeHeader(contentType);
      if (contentTypeValue) formattedHeaders['Content-Type'] = contentTypeValue;
    }
  }

  const config = {
    method: method.toLowerCase(),
    headers: {...formattedHeaders, "User-Agent": "PostierRuntime/1.0.0"},
    data: (body && contentType) ? formatRequestBody(body, contentType) : null
  };

  const startTime: number = performance.now();
  let response: Response | null = null;
  let error: any | null = null;
  let responseData: ResponseData = {
    id: requestData.id,
    timestamp: Date.now(),
    status: 0,
    statusText: '',
    headers: null,
    data: null,
    time: 0,
    size: 0,
  };

  try {
    response = await fetch(url, {...config});
    const endTimeRequest: number = performance.now();
    const bodyArrayBuffer: ArrayBuffer = await response.arrayBuffer();
    const bodyBlob: Blob = new Blob([bodyArrayBuffer]);
    const body: string = new TextDecoder().decode(bodyArrayBuffer);

    // map the headers
    const headers: KeyValue[] = [];
    response.headers.forEach((value: string, key: string) => {
      headers.push({key, value, enabled: true})
    });

    responseData = {
      ...responseData,
      status: response.status,
      statusText: response.statusText,
      headers: headers,
      data: body,
      time: endTimeRequest - startTime,
      size: bodyBlob.size
    };
  } catch (err: any) {
    const endTime = performance.now();
    error = err;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      responseData = {
        ...responseData,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        time: endTime - startTime,
        size: JSON.stringify(error.response.data || '').length,
      };
    } else if (error.request) {
      // The request was made but no response was received
      responseData = {
        ...responseData,
        status: 0,
        statusText: 'No response received',
        headers: null,
        data: null,
        time: endTime - startTime,
        size: 0,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      responseData = {
        ...responseData,
        status: 0,
        statusText: `Request Error: ${error.message}`,
        headers: null,
        data: null,
        time: endTime - startTime,
        size: 0,
      };
    }
  } finally {
    const endTimePostier: number = performance.now();
    const debug: KeyValue[] = [];
    debug.push(
      {key: 'Postier UID', value: `${requestData.id}`, enabled: true},
      {key: 'Request time', value: `${responseData.time}ms`, enabled: true},
      {key: 'Processing time', value: `${endTimePostier - startTime}ms`, enabled: true},
      {key: 'Request url', value: `${url}`, enabled: true},
      {key: 'Request config', value: `${JSON.stringify(config)}`, enabled: true},
      {key: 'Response sum headers', value: `${responseData.headers?.length}`, enabled: true},
    );

    if (response) {
      debug.push(
        {key: 'Response status', value: `${response.status} (${response.statusText})`, enabled: true},
        {key: 'Response body', value: `bodyUsed: ${response.bodyUsed} - blob size: ${responseData.size} bytes`, enabled: true},
      );
    } else if (error && error.response) {
      debug.push(
        {key: 'Response status', value: `${error.response.status} (${error.response.statusText})`, enabled: true},
        {key: 'Response body', value: `bodyUsed: ${error.response.bodyUsed} - blob size: ${responseData.size} bytes`, enabled: true},
      );
    } else if (error && error.request) {
      debug.push(
        {key: 'Response status', value: `No response received`, enabled: true}
      );
    } else {
      if (error) debug.push({key: 'Response status', value: `${error.message}`, enabled: true});
    }

    return {request: requestData, response: responseData, debug};
  }
}; 