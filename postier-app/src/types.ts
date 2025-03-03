export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
export const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];

export type ContentType = 'form-data' | 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'none';

export type ViewMode = 'raw' | 'preview' | 'pretty';

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  id: string;
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  body: string;
  contentType: ContentType;
}

export interface RequestDataWithQuery extends RequestData {
  query: KeyValue[]
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

export interface RequestHistoryItem extends RequestData {
  timestamp: number;
  response?: ResponseData;
} 