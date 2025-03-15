import { ContentType, KeyValue, PostierObject, RequestData } from '../types/types.ts';
import { invoke } from '@tauri-apps/api';

// interface for http metrics
interface HttpMetrics {
  prepare: number;       // request preparation time in ms
  socket_init: number;   // socket initialization time in ms
  dns_lookup: number;    // dns resolution time in ms
  tcp_handshake: number; // tcp handshake time in ms
  transfer_start: number;// transfer start time in ms
  download: number;      // download time in ms
  process: number;       // process time in ms
  total: number;         // total time in ms
}

// extended interface for metrics
interface PostierObjectWithMetrics extends PostierObject {
  metrics: HttpMetrics;
}

// reimplement utility functions to be consistent
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

// main function that calls our rust http client
export const sendRequest = async (requestData: RequestData): Promise<PostierObjectWithMetrics> => {
  try {
    // dynamic import of tauri to avoid typing problems
    //const tauriApi = await import('@tauri-apps/api');
    
    // direct call to the rust plugin via tauri
    const result = await invoke<PostierObjectWithMetrics>('plugin:http_metrics|send_request_with_metrics', {
      requestData
    });
    
    return result;
  } catch (error) {
    // in case of error in the rust plugin, build an error response
    console.error('Error in Rust HTTP client:', error);
    
    const errorResponse: PostierObjectWithMetrics = {
      request: requestData,
      response: {
        id: requestData.id,
        timestamp: Date.now(),
        status: 0,
        statusText: `Error: ${error}`,
        headers: null,
        data: error instanceof Error ? error.message : String(error),
        time: 0,
        size: 0,
      },
      debug: [
        { key: 'Error', value: String(error), enabled: true }
      ],
      metrics: {
        prepare: 0,
        socket_init: 0,
        dns_lookup: 0,
        tcp_handshake: 0,
        transfer_start: 0,
        download: 0,
        process: 0,
        total: 0,
      }
    };
    
    return errorResponse;
  }
}; 