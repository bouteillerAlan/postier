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
  timestamp: number;
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  query: KeyValue[] | null;
  contentType: ContentType;
  body: string;
}

export interface ResponseData {
  id: string;
  timestamp: number;
  status: number;
  statusText: string;
  headers: KeyValue[] | null;
  data: string | null;
  time: number;
  size: number;
}

export interface RequestContext {
  request: RequestData;
  response: ResponseData | null;
  debug: KeyValue[] | null;
}
